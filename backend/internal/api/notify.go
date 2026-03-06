package api

import (
	"context"
	"log"

	"github.com/JHelar/PiggySplit.git/internal/db/generated"
	"github.com/JHelar/PiggySplit.git/internal/stream"
)

func notifyGroupMembers(groupId int64, members []generated.GetGroupMemberTotalsRow, ctx context.Context, api *ApiContext) {
	for _, member := range members {
		group, err := getGroupForUser(member.UserID, groupId, ctx, api)
		if err != nil {
			log.Printf("checkGroupResolvedState failed to get group for member")
		}
		message := stream.NewMessage(stream.MessageEventGroup, group)
		api.Pool.SendMessage(member.UserID, message)
	}
}

func notifyExpense(groupId int64, expenseId int64, members []generated.GetGroupMemberTotalsRow, ctx context.Context, api *ApiContext) {
	for _, member := range members {
		group, err := getGroupForUser(member.UserID, groupId, ctx, api)
		if err != nil {
			log.Printf("checkGroupResolvedState failed to get group for member")
			continue
		}
		expense, err := api.DB.Queries.GetExpenseById(ctx, generated.GetExpenseByIdParams{
			ID:      expenseId,
			GroupID: groupId,
			UserID:  member.UserID,
		})
		if err != nil {
			log.Printf("checkGroupResolvedState failed to get expense for member")
			continue
		}

		message := stream.NewMessage(stream.MessageEventGroup, group)
		api.Pool.SendMessage(member.UserID, message)

		expenseEvent := struct {
			Expense generated.GetExpenseByIdRow `json:"expense"`
			Group   GetGroupResponse            `json:"group"`
		}{
			Expense: expense,
			Group:   group,
		}
		message = stream.NewMessage(stream.MessageEventExpense, expenseEvent)
		api.Pool.SendMessage(member.UserID, message)
	}
}
