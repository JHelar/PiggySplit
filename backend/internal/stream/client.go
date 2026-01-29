package stream

type ClientConnection struct {
	ID     int64
	userID int64
	events chan string
	done   chan struct{}
}

func (client *ClientConnection) Events() <-chan string {
	return client.events
}
