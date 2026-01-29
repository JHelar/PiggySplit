package stream

import (
	"math/rand"
	"sync"

	"github.com/gofiber/fiber/v2/log"
)

type ConnectionPool struct {
	mutex       sync.RWMutex
	connections map[int64]*ClientConnection
}

const EVENTS_BUFFER_SIZE = 16

func New() *ConnectionPool {
	return &ConnectionPool{
		connections: map[int64]*ClientConnection{},
	}
}

func (pool *ConnectionPool) AddConnection(userID int64) *ClientConnection {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()

	connection := &ClientConnection{
		events: make(chan string, EVENTS_BUFFER_SIZE),
		done:   make(chan struct{}),
		userID: userID,
		ID:     rand.Int63(),
	}

	pool.connections[connection.ID] = connection

	log.Infof("ConnectionPool client(%d) connected", connection.ID)
	return connection
}

func (pool *ConnectionPool) RemoveConnection(id int64) {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()

	if connection, ok := pool.connections[id]; ok {
		close(connection.done)
		close(connection.events)
		delete(pool.connections, id)
		log.Infof("ConnectionPool client(%d) disconnected", id)
	}
}
