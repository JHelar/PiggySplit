package stream

import (
	"encoding/json"
	"fmt"

	"github.com/gofiber/fiber/v2/log"
)

type MessageEvent = string

const (
	MessageEventGroup MessageEvent = "group"
)

type EventMessage struct {
	event      MessageEvent
	data       any
	sse_string string
}

func NewMessage(event MessageEvent, data any) *EventMessage {
	return &EventMessage{
		event:      event,
		data:       data,
		sse_string: "",
	}
}

func (message *EventMessage) SSEString() (string, error) {
	if len(message.sse_string) == 0 {
		data, err := json.Marshal(message.data)
		if err != nil {
			return "", fmt.Errorf("Failed to marshall data payload for event(%s): %s", message.event, err.Error())
		}
		message.sse_string = fmt.Sprintf("event: %s\ndata: %s\n\n", message.event, data)
	}

	return message.sse_string, nil
}

func (pool *ConnectionPool) SendMessage(userID int64, message *EventMessage) {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()

	for _, connection := range pool.connections {
		if connection.userID != userID {
			continue
		}

		sse_string, err := message.SSEString()
		if err != nil {
			log.Error(err)
		}

		select {
		case connection.events <- sse_string:
		default:
			{
				log.Warnf("Failed to send message to client(%d)", connection.ID)
			}
		}
	}
}
