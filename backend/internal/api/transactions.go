package api

import (
	"context"
	"fmt"
	"log"
	"strconv"

	"github.com/JHelar/PiggySplit.git/internal/db/generated"
	"github.com/gofiber/fiber/v2"
)

const TransactionIdParam = "transactionId"
const TransactionSessionLocal = "transactionSession"

type TransactionSession struct {
	generated.GetGroupMemberRow

	TransactionID int64
}

func verifyTransactionSession(c *fiber.Ctx) error {
	session := mustGetGroupSession(c)
	transactionId, err := strconv.ParseInt(c.Params(TransactionIdParam), 10, 64)
	if err != nil {
		log.Printf("mustGetTransactionSession failed to convert transaction id")
		return fiber.ErrInternalServerError
	}

	c.Locals(TransactionSessionLocal, TransactionSession{
		TransactionID:     transactionId,
		GetGroupMemberRow: session,
	})

	return c.Next()
}

func mustGetTransactionSession(c *fiber.Ctx) TransactionSession {
	return c.Locals(TransactionSessionLocal).(TransactionSession)
}

func getTransactions(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()

	session := mustGetGroupSession(c)

	transactions, err := api.DB.Queries.GetUserGroupTransactions(ctx, generated.GetUserGroupTransactionsParams{
		UserID:  session.UserID,
		GroupID: session.GroupID,
	})

	if err != nil {
		log.Printf("getTransactions failed to get transactions for user(%v) and group(%v)", session.UserID, session.GroupID)
		return fiber.DefaultErrorHandler(c, err)
	}

	return c.JSON(transactions)
}

func getTransaction(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()

	session := mustGetTransactionSession(c)

	transaction, err := api.DB.Queries.GetUserGroupTransaction(ctx, generated.GetUserGroupTransactionParams{
		ID:      session.TransactionID,
		UserID:  session.UserID,
		GroupID: session.GroupID,
	})

	if err != nil {
		fmt.Printf("getTransaction failed to get transaction(%v) for user(%v) and group(%v)", session.TransactionID, session.UserID, session.GroupID)
		return fiber.DefaultErrorHandler(c, err)
	}

	return c.JSON(transaction)
}

func payTransaction(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()

	session := mustGetTransactionSession(c)
	log.Printf("payTransaction for user(%v) transaction(%v) group(%v)", session.UserID, session.TransactionID, session.GroupID)

	var currentUserDept float64
	err := api.DB.RunAsTransaction(ctx, func(q *generated.Queries) error {
		transaction, err := q.PayUserGroupTransaction(ctx, generated.PayUserGroupTransactionParams{
			FromState:     string(TransactionStateUnpaid),
			ToState:       string(TransactionStatePaid),
			UserID:        session.UserID,
			GroupID:       session.GroupID,
			TransactionID: session.TransactionID,
		})
		if err != nil {
			log.Printf("payTransaction failed to pay transaction(%v) for user(%v) and group(%v)", session.TransactionID, session.UserID, session.GroupID)
			log.Printf("payTransaction err %v", err.Error())
			return fiber.DefaultErrorHandler(c, err)
		}

		receipt, err := q.UpdateReceiptDeptById(ctx, generated.UpdateReceiptDeptByIdParams{
			Amount:    transaction.Amount,
			ReceiptID: transaction.FromReceiptID,
		})
		if err != nil {
			fmt.Printf("payTransaction failed to update receipt(%v) for user(%v) and group(%v)", transaction.FromReceiptID, session.UserID, session.GroupID)
			return fiber.DefaultErrorHandler(c, err)
		}

		if _, err := q.UpdateReceiptDeptById(ctx, generated.UpdateReceiptDeptByIdParams{
			Amount:    -transaction.Amount,
			ReceiptID: transaction.ToReceiptID,
		}); err != nil {
			fmt.Printf("payTransaction failed to update receipt(%v) for user(%v) and group(%v)", transaction.FromReceiptID, session.UserID, session.GroupID)
			return fiber.DefaultErrorHandler(c, err)
		}

		currentUserDept = receipt.CurrentDept
		if currentUserDept == 0 {
			if err := q.UpsertGroupMember(ctx, generated.UpsertGroupMemberParams{
				GroupID: session.GroupID,
				UserID:  session.UserID,
				Role:    session.MemberRole,
				State:   string(MemberStateResolved),
			}); err != nil {
				fmt.Printf("payTransaction failed to update member state for user(%v) and group(%v)", session.UserID, session.GroupID)
				return fiber.DefaultErrorHandler(c, err)
			}
		}
		return nil
	})

	if err != nil {
		log.Printf("payTransaction failed to pay transaction(%v)", session.TransactionID)
		return fiber.DefaultErrorHandler(c, err)
	}

	if currentUserDept == 0 {
		go checkGroupResolvedState(session.GroupID, api)
	}

	return c.SendString("Transaction payed")
}
