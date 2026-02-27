package api

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strconv"

	"github.com/JHelar/PiggySplit.git/internal/db/generated"
	"github.com/gofiber/fiber/v2"
)

type MemberInfo struct {
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	MemberID   int64  `json:"member_id"`
	MemberRole string `json:"member_role"`
}

func getMemberInfo(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()

	session := mustGetGroupSession(c)
	member, err := api.DB.Queries.GetGroupMemberInfoForUser(ctx, generated.GetGroupMemberInfoForUserParams{
		GroupID: session.GroupID,
		UserID:  session.UserID,
	})
	if err != nil {
		log.Printf("getMemberInfo failed to get member info for user(%v) in group(%v): %v", session.UserID, session.GroupID, err.Error())
		return fiber.DefaultErrorHandler(c, err)
	}

	return c.JSON(member)
}

func getMembers(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()

	session := mustGetGroupSession(c)

	members, err := api.DB.Queries.GetGroupMembersForUser(ctx, generated.GetGroupMembersForUserParams{
		GroupID: session.GroupID,
		UserID:  session.UserID,
	})
	if err == sql.ErrNoRows || len(members) == 0 {
		log.Printf("getMembers user(%v) is not member in group(%v)\n", session.UserID, session.GroupID)
		return fiber.ErrUnauthorized
	}

	if err != nil {
		log.Printf("getMembers error getting members for group(%v)\n", session.GroupID)
		return fiber.DefaultErrorHandler(c, err)
	}

	return c.JSON(members)
}

func addMember(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB
	ctx := context.Background()
	groupId, err := strconv.ParseInt(c.Params(GroupIdParam), 10, 64)
	if err != nil {
		log.Printf("addMember failed to convert group id")
		return fiber.ErrInternalServerError
	}

	session := mustGetUserSession(c)

	_, err = db.Queries.GetGroupMember(ctx, generated.GetGroupMemberParams{
		GroupID: groupId,
		UserID:  session.UserID.Int64,
	})
	if err == nil {
		log.Printf("addMember user(%v) already member in group(%v)\n", session.UserID, groupId)
		return c.SendString("user already a member")
	}
	if err != sql.ErrNoRows {
		log.Printf("addMember error getting member info for user(%v) in group(%v)", session.UserID, groupId)
		return fiber.DefaultErrorHandler(c, err)
	}

	if err = db.Queries.UpsertGroupMember(ctx, generated.UpsertGroupMemberParams{
		GroupID: groupId,
		UserID:  session.UserID.Int64,
		State:   string(MemberStateAdding),
		Role:    string(MemberRoleRegular),
	}); err != nil {
		log.Printf("addMember failed to add member(%v) to group(%v)", session.UserID, groupId)
		return err
	}

	go func() {
		members, _ := api.DB.Queries.GetGroupMemberTotals(ctx, groupId)
		notifyGroupMembers(groupId, members, ctx, api)
	}()

	return c.SendString("Member added")
}

func memberReadyToPay(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB
	ctx := context.Background()
	session := mustGetGroupSession(c)

	if session.MemberState != string(MemberStateAdding) {
		err := fmt.Errorf("member in incorrect state '%s'", session.MemberState)
		log.Printf("memberReadyToPay %s", err.Error())
		return fiber.DefaultErrorHandler(c, err)
	}
	if err := db.Queries.UpsertGroupMember(ctx, generated.UpsertGroupMemberParams{
		GroupID: session.GroupID,
		UserID:  session.UserID,
		State:   string(MemberStateReady),
		Role:    session.MemberRole,
	}); err != nil {
		log.Printf("memberReadyToPay failed to update member state group(%v) for user(%v)", session.GroupID, session.UserID)
		return fiber.DefaultErrorHandler(c, err)
	}

	go func() {
		members, _ := api.DB.Queries.GetGroupMemberTotals(ctx, session.GroupID)
		notifyGroupMembers(session.GroupID, members, ctx, api)
	}()

	go func() {
		checkGroupReadyState(session.GroupID, api)
	}()

	return c.SendString("Member updated")
}

func removeMember(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB
	ctx := context.Background()

	session := mustGetGroupSession(c)

	memberUserId, err := strconv.ParseInt(c.Query("member_id"), 10, 64)
	if err != nil {
		log.Println("addMember failed to convert member_id id")
		return fiber.DefaultErrorHandler(c, err)
	}

	if session.MemberRole != string(MemberRoleAdmin) {
		log.Printf("removeMember user(%v) is not an admin", session.UserID)
		return fiber.ErrUnauthorized
	}

	if err = db.Queries.DeleteGroupMember(ctx, generated.DeleteGroupMemberParams{
		GroupID: session.GroupID,
		UserID:  memberUserId,
	}); err != nil {
		log.Printf("removeMember failed to remove member(%v) from group(%v)", memberUserId, session.GroupID)
		return fiber.DefaultErrorHandler(c, err)
	}

	go func() {
		members, _ := api.DB.Queries.GetGroupMemberTotals(ctx, session.GroupID)
		notifyGroupMembers(session.GroupID, members, ctx, api)
	}()

	return c.SendString("Member removed")
}
