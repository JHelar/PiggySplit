package api

import (
	"context"
	"log"

	"github.com/JHelar/PiggySplit.git/internal/db/generated"
	"github.com/gofiber/fiber/v2"
)

type GetGroupResponse struct {
	generated.GetGroupForUserByIdRow
	Expenses []generated.GetGroupExpensesRow       `json:"expenses"`
	Members  []generated.GetGroupMembersForUserRow `json:"members"`
}

func getGroupForUser(userId int64, groupId int64, ctx context.Context, api *ApiContext) (GetGroupResponse, error) {
	db := api.DB
	group, err := db.Queries.GetGroupForUserById(ctx, generated.GetGroupForUserByIdParams{
		ID:     groupId,
		UserID: userId,
	})

	if err != nil {
		log.Printf("getGroupForUser, error getting user group")
		return GetGroupResponse{}, fiber.ErrNotFound
	}

	expenses, err := db.Queries.GetGroupExpenses(ctx, generated.GetGroupExpensesParams{
		GroupID: groupId,
		UserID:  userId,
	})

	if err != nil {
		log.Printf("getGroupForUser, error getting group expenses")
		return GetGroupResponse{}, fiber.ErrNotFound
	}

	members, err := db.Queries.GetGroupMembersForUser(ctx, generated.GetGroupMembersForUserParams{
		GroupID: group.ID,
		UserID:  userId,
	})

	if err != nil {
		log.Printf("getGroupForUser, error getting group members")
		return GetGroupResponse{}, fiber.ErrNotFound
	}

	response := GetGroupResponse{
		GetGroupForUserByIdRow: group,
		Expenses:               expenses,
		Members:                members,
	}

	return response, nil
}
