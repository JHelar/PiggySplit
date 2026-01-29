package api

import (
	"context"
	"database/sql"
	"log"
	"strconv"

	"github.com/JHelar/PiggySplit.git/internal/db/generated"
	"github.com/gofiber/fiber/v2"
)

const ExpenseIdParam = "expenseId"

func getExpenses(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()

	session := mustGetGroupSession(c)

	expenses, err := api.DB.Queries.GetGroupExpenses(ctx, generated.GetGroupExpensesParams{
		GroupID: session.GroupID,
		UserID:  session.UserID,
	})

	if err != nil {
		log.Printf("getExpenses failed to get group(%v) expenses for user(%v)", session.GroupID, session.UserID)
		return fiber.DefaultErrorHandler(c, err)
	}

	return c.JSON(expenses)
}

func getExpense(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB
	ctx := context.Background()

	expenseId, err := strconv.ParseInt(c.Params(ExpenseIdParam), 10, 64)
	if err != nil {
		log.Printf("getExpense failed to convert group id")
		return fiber.ErrInternalServerError
	}

	session := mustGetGroupSession(c)

	expense, err := db.Queries.GetExpenseById(ctx, generated.GetExpenseByIdParams{
		ID:      expenseId,
		UserID:  session.UserID,
		GroupID: session.GroupID,
	})

	if err != nil {
		log.Printf("getExpense failed to get expense(%v) for user(%v)", expenseId, session.UserID)
		return fiber.DefaultErrorHandler(c, err)
	}

	return c.JSON(expense)
}

type AddExpense struct {
	ExpenseName string  `json:"expense_name" xml:"expense_name" form:"expense_name"`
	ExpenseCost float64 `json:"expense_cost" xml:"expense_cost" form:"expense_cost"`
}

func addExpense(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB
	ctx := context.Background()
	payload := new(AddExpense)

	if err := c.BodyParser(payload); err != nil {
		log.Println("addExpense failed to parse body")
		return fiber.DefaultErrorHandler(c, err)
	}

	session := mustGetGroupSession(c)

	group, _ := db.Queries.GetGroupForUserById(ctx, generated.GetGroupForUserByIdParams{
		ID:     session.GroupID,
		UserID: session.UserID,
	})

	if !canModifyExpenses(GroupState(group.GroupState)) {
		log.Printf("addExpense cannot add expense in the group with state(%s)", group.GroupState)
		return fiber.DefaultErrorHandler(c, &fiber.Error{
			Code:    fiber.ErrForbidden.Code,
			Message: "cannot add expense in group, invalid state",
		})
	}

	expense, err := db.Queries.AddExpense(ctx, generated.AddExpenseParams{
		Name:    payload.ExpenseName,
		Cost:    payload.ExpenseCost,
		GroupID: session.GroupID,
		UserID:  session.UserID,
	})

	if err != nil {
		log.Printf("addExpense failed to add expense for user(%v) in group(%v)", session.UserID, session.GroupID)
		return fiber.DefaultErrorHandler(c, err)
	}

	if group.GroupState != string(GroupStateExpenses) {
		if err := db.Queries.UpdateGroupState(ctx, generated.UpdateGroupStateParams{
			State:  string(GroupStateExpenses),
			ID:     session.GroupID,
			UserID: session.UserID,
		}); err != nil {
			log.Printf("addExpense failed to update group state for user(%v) in group(%v)", session.UserID, session.GroupID)
		}
	}

	if err := db.Queries.UpsertGroupMember(ctx, generated.UpsertGroupMemberParams{
		GroupID: session.GroupID,
		UserID:  session.UserID,
		State:   string(MemberStateAdding),
		Role:    session.MemberRole,
	}); err != nil {
		log.Printf("addExpense failed to update member state for user(%v) in group(%v)", session.UserID, session.GroupID)
	}

	return c.JSON(expense)
}

type UpdateExpense struct {
	ExpenseName string  `json:"expense_name" xml:"expense_name" form:"expense_name"`
	ExpenseCost float64 `json:"expense_cost" xml:"expense_cost" form:"expense_cost"`
}

func updateExpense(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB
	ctx := context.Background()
	payload := new(UpdateExpense)

	if err := c.BodyParser(payload); err != nil {
		log.Println("updateExpense failed to parse body")
		return fiber.DefaultErrorHandler(c, err)
	}

	expenseId, err := strconv.ParseInt(c.Params(ExpenseIdParam), 10, 64)
	if err != nil {
		log.Printf("removeExpense failed to convert group id")
		return fiber.ErrInternalServerError
	}

	session := mustGetGroupSession(c)
	group, _ := db.Queries.GetGroupForUserById(ctx, generated.GetGroupForUserByIdParams{
		ID:     session.GroupID,
		UserID: session.UserID,
	})

	if !canModifyExpenses(GroupState(group.GroupState)) {
		log.Printf("updateExpense cannot update expense in the group with state(%s)", group.GroupState)
		return fiber.DefaultErrorHandler(c, &fiber.Error{
			Code:    fiber.ErrForbidden.Code,
			Message: "cannot update expense in group, invalid state",
		})
	}

	expense, err := db.Queries.UpdateExpense(ctx, generated.UpdateExpenseParams{
		Cost:    payload.ExpenseCost,
		Name:    payload.ExpenseName,
		ID:      expenseId,
		GroupID: session.GroupID,
		UserID:  session.UserID,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("updateExpense no expense found")
			return fiber.ErrNotFound
		}

		log.Printf("updateExpense failed to update expense(%v) for user(%v)", expenseId, session.UserID)
		return fiber.ErrInternalServerError
	}

	if group.GroupState != string(GroupStateExpenses) {
		if err := db.Queries.UpdateGroupState(ctx, generated.UpdateGroupStateParams{
			State:  string(GroupStateExpenses),
			ID:     group.ID,
			UserID: session.UserID,
		}); err != nil {
			log.Printf("updateExpense failed to update group state for user(%v) in group(%v)", session.UserID, group.ID)
		}
	}

	if err := db.Queries.UpsertGroupMember(ctx, generated.UpsertGroupMemberParams{
		GroupID: group.ID,
		UserID:  session.UserID,
		State:   string(MemberStateAdding),
		Role:    group.MemberRole,
	}); err != nil {
		log.Printf("updateExpense failed to update member state for user(%v) in group(%v)", session.UserID, group.ID)
	}

	return c.JSON(expense)
}

func removeExpense(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()
	db := api.DB

	expenseId, err := strconv.ParseInt(c.Params(ExpenseIdParam), 10, 64)
	if err != nil {
		log.Printf("removeExpense failed to convert expense id")
		return fiber.ErrInternalServerError
	}

	session := mustGetGroupSession(c)

	if err := db.Queries.RemoveExpense(ctx, generated.RemoveExpenseParams{
		ID:      expenseId,
		UserID:  session.UserID,
		GroupID: session.GroupID,
	}); err != nil {
		if err == sql.ErrNoRows {
			log.Printf("removeExpense no expense found")
			return fiber.ErrNotFound
		}

		log.Printf("removeExpense failed to delete expense(%v) for user(%v)", expenseId, session.UserID)
		return fiber.ErrInternalServerError
	}

	return c.SendString("Expense removed")
}
