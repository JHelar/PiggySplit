package api

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strconv"

	"github.com/JHelar/PiggySplit.git/internal/db/generated"
	"github.com/JHelar/PiggySplit.git/internal/utils"
	"github.com/gofiber/fiber/v2"
)

type ColorTheme string
type GroupState string
type MemberState string
type MemberRole string
type TransactionState string

const (
	ColorThemeBlue  ColorTheme = "color_theme:blue"
	ColorThemeGreen ColorTheme = "color_theme:green"
)

const (
	GroupStateExpenses   GroupState = "group_state:expenses"
	GroupStateGenerating GroupState = "group_state:generating"
	GroupStatePaying     GroupState = "group_state:paying"
	GroupStateResolved   GroupState = "group_state:resolved"
	GroupStateArchived   GroupState = "group_state:archived"
)

const (
	MemberRoleAdmin   MemberRole = "member_role:admin"
	MemberRoleRegular MemberRole = "member_role:regular"
)

const (
	MemberStateAdding   MemberState = "member_state:adding"
	MemberStateReady    MemberState = "member_state:ready"
	MemberStateResolved MemberState = "member_state:resolved"
	MemberStatePaying   MemberState = "member_state:paying"
)

const (
	TransactionStateUnpaid TransactionState = "transaction_state:unpaid"
	TransactionStatePaid   TransactionState = "transaction_state:Paid"
)

func canModifyExpenses(groupState GroupState) bool {
	return groupState == GroupStateExpenses
}

const GroupSessionLocal = "groupSession"
const GroupIdParam = "groupId"

func verifyGroupMember(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB

	ctx := context.Background()

	groupId, err := strconv.ParseInt(c.Params(GroupIdParam), 10, 64)
	if err != nil {
		log.Printf("verifyGroup failed to convert group id")
		return fiber.ErrInternalServerError
	}

	session := mustGetUserSession(c)

	member, err := db.Queries.GetGroupMember(ctx, generated.GetGroupMemberParams{
		GroupID: groupId,
		UserID:  session.UserID.Int64,
	})

	if err != nil {
		log.Printf("verifyGroup user(%v) cannot access group(%v)", session.UserID.Int64, groupId)
		return fiber.ErrUnauthorized
	}

	c.Locals(GroupSessionLocal, member)
	return c.Next()
}

func mustGetGroupSession(c *fiber.Ctx) generated.GetGroupMemberRow {
	return c.Locals(GroupSessionLocal).(generated.GetGroupMemberRow)
}

type CreateGroup struct {
	DisplayName string `json:"display_name" xml:"display_name" form:"display_name"`
	ColorTheme  string `json:"color_theme" xml:"color_theme" form:"color_theme"`
}

func createGroup(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB

	ctx := context.Background()
	payload := new(CreateGroup)

	if err := c.BodyParser(payload); err != nil {
		return err
	}

	log.Printf("create %v", payload)

	session := mustGetUserSession(c)

	group_result, err := db.Queries.CreateGroup(ctx, generated.CreateGroupParams{
		DisplayName: payload.DisplayName,
		ColorTheme:  payload.ColorTheme,
		State:       string(GroupStateExpenses),
	})

	log.Printf("Group created %v", group_result)

	if err != nil {
		log.Printf("createGroup: error creating group, %s", err.Error())
		return fiber.ErrInternalServerError
	}

	if err := db.Queries.UpsertGroupMember(ctx, generated.UpsertGroupMemberParams{
		GroupID: group_result.ID,
		UserID:  session.UserID.Int64,
		State:   string(MemberStateAdding),
		Role:    string(MemberRoleAdmin),
	}); err != nil {
		log.Printf("createGroup: error creating group admin member %s", err.Error())
		return fiber.ErrInternalServerError
	}

	return c.JSON(fiber.Map{
		"group_id":    group_result.ID,
		"color_theme": group_result.ColorTheme,
	})
}

type GroupResponseRow struct {
	generated.GetGroupsByUserIdRow
	Members []generated.GetGroupMembersForUserRow `json:"members"`
}

func getGroups(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB
	ctx := context.Background()

	session := mustGetUserSession(c)

	group_rows, err := db.Queries.GetGroupsByUserId(ctx, session.UserID.Int64)
	if err != nil {
		log.Printf("getGroups, error getting user groups")
		return fiber.ErrInternalServerError
	}

	groups := []GroupResponseRow{}
	for _, group := range group_rows {
		members, _ := db.Queries.GetGroupMembersForUser(ctx, generated.GetGroupMembersForUserParams{
			GroupID: group.ID,
			UserID:  session.UserID.Int64,
		})
		groups = append(groups, GroupResponseRow{
			GetGroupsByUserIdRow: group,
			Members:              members,
		})
	}

	return c.JSON(groups)
}

func getGroup(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()
	session := mustGetGroupSession(c)

	response, err := getGroupForUser(session.UserID, session.GroupID, ctx, api)
	if err != nil {
		return err
	}

	return c.JSON(response)
}

type UpdateGroup struct {
	DisplayName string `json:"display_name" xml:"display_name" form:"display_name"`
	ColorTheme  string `json:"color_theme" xml:"color_theme" form:"color_theme"`
}

func updateGroup(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()
	payload := new(UpdateGroup)

	session := mustGetGroupSession(c)
	db := api.DB
	if err := c.BodyParser(payload); err != nil {
		log.Printf("updateGroup failed to parse payload")
		return fiber.DefaultErrorHandler(c, err)
	}

	group, err := db.Queries.UpdateGroupById(ctx, generated.UpdateGroupByIdParams{
		DisplayName: payload.DisplayName,
		ColorTheme:  payload.ColorTheme,
		ID:          session.GroupID,
		UserID:      session.UserID,
	})

	if err != nil && err == sql.ErrNoRows {
		log.Println("updateGroup user cannot update group")
		return fiber.ErrUnauthorized
	}

	if err != nil {
		log.Println("updateGroup unable to update group")
		return fiber.ErrInternalServerError
	}

	return c.JSON(group)
}

func deleteGroup(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()

	session := mustGetGroupSession(c)
	log.Printf("Trying to archive groupId(%d) userID(%d)", session.GroupID, session.UserID)
	if err := api.DB.Queries.ArchiveGroupById(ctx, generated.ArchiveGroupByIdParams{
		GroupID:    session.GroupID,
		MemberRole: string(MemberRoleAdmin),
		UserID:     session.UserID,
	}); err != nil {
		log.Printf("deleteGroup failed to delete group: %v\n", err.Error())
		return fiber.DefaultErrorHandler(c, err)
	}

	return c.SendString("Group deleted")
}

func checkGroupReadyState(groupId int64, api *ApiContext) {
	db := api.DB
	ctx := context.Background()

	members, err := db.Queries.GetGroupMemberTotals(ctx, groupId)

	if err != nil {
		log.Printf("checkGroupReadyState failed to get group member totals")
		return
	}
	for _, member := range members {
		if member.State != string(MemberStateReady) {
			return
		}
	}

	log.Printf("checkGroupReadyState group(%d) is ready to pay", groupId)

	if err := db.Queries.UpdateGroupStateById(ctx, generated.UpdateGroupStateByIdParams{
		GroupState: string(GroupStateGenerating),
		GroupID:    groupId,
	}); err != nil {
		log.Printf("checkGroupReadyState failed to update group state: %v", err.Error())
		return
	}
	if err := db.RunAsTransaction(ctx, func(q *generated.Queries) error {
		// Create members
		groupTotal := 0.0
		for _, member := range members {
			groupTotal = groupTotal + member.Total.(float64)
		}

		payPerMember := groupTotal / float64(len(members))
		var receipts []generated.CreateReceiptRow

		for _, member := range members {
			total_dept := member.Total.(float64) - payPerMember

			receipt, err := q.CreateReceipt(ctx, generated.CreateReceiptParams{
				GroupID:     groupId,
				UserID:      member.UserID,
				TotalDept:   total_dept,
				CurrentDept: total_dept,
			})

			if err != nil {
				return err
			}

			// Owes money
			if total_dept < 0 {
				log.Printf("Set user(%v) to paying", member.UserID)
				if err := q.UpdateGroupMemberState(ctx, generated.UpdateGroupMemberStateParams{
					GroupID:     groupId,
					UserID:      member.UserID,
					MemberState: string(MemberStatePaying),
				}); err != nil {
					return fmt.Errorf("checkGroupReadyState error updating member user(%d) state: %v", member.UserID, err.Error())
				}
			} else {
				log.Printf("Set user(%v) to resolved", member.UserID)
				if err := q.UpdateGroupMemberState(ctx, generated.UpdateGroupMemberStateParams{
					GroupID:     groupId,
					UserID:      member.UserID,
					MemberState: string(MemberStateResolved),
				}); err != nil {
					return fmt.Errorf("checkGroupReadyState error updating member user(%d) state: %v", member.UserID, err.Error())
				}
			}

			receipts = append(receipts, receipt)
		}

		transactions, err := utils.BalanceReceipts(receipts)
		if err != nil {
			return fmt.Errorf("checkGroupReadyState failed to balance receipts, %v", err.Error())
		}

		if len(transactions) == 0 {
			log.Printf("checkGroupReadyState no transactions created, group already balanced")
			if err := q.UpdateGroupStateById(ctx, generated.UpdateGroupStateByIdParams{
				GroupState: string(GroupStateResolved),
				GroupID:    groupId,
			}); err != nil {
				return fmt.Errorf("checkGroupReadyState error updating group state: %v", err.Error())
			}
		} else {
			for _, transaction := range transactions {
				q.CreateMemberTransaction(ctx, generated.CreateMemberTransactionParams{
					FromReceiptID: transaction.FromID,
					ToReceiptID:   transaction.ToID,
					State:         string(TransactionStateUnpaid),
					Amount:        transaction.Cost,
				})
			}
			if err := q.UpdateGroupStateById(ctx, generated.UpdateGroupStateByIdParams{
				GroupState: string(GroupStatePaying),
				GroupID:    groupId,
			}); err != nil {
				return fmt.Errorf("checkGroupReadyState error updating group state: %v", err.Error())
			}
		}

		return nil
	}); err != nil {
		log.Printf("checkGroupReadyState failed to create receipts: %v", err.Error())
		return
	}

	// Notify members
	notifyGroupMembers(groupId, members, ctx, api)
}

func checkGroupResolvedState(groupId int64, api *ApiContext) {
	db := api.DB
	ctx := context.Background()
	members, err := db.Queries.GetGroupMemberTotals(ctx, groupId)

	if err != nil {
		log.Printf("checkGroupResolvedState failed to get group member totals")
		return
	}
	for _, member := range members {
		if member.State != string(MemberStateResolved) {
			return
		}
	}

	log.Printf("checkGroupResolvedState group(%d) is resolved", groupId)
	if err := db.Queries.UpdateGroupStateById(ctx, generated.UpdateGroupStateByIdParams{
		GroupID:    groupId,
		GroupState: string(GroupStateResolved),
	}); err != nil {
		log.Printf("checkGroupResolvedState failed to update group state: %v", err.Error())
		return
	}

	// Notify members
	notifyGroupMembers(groupId, members, ctx, api)
}
