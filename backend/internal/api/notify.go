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
