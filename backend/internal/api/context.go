package api

import (
	"github.com/JHelar/PiggySplit.git/internal/db"
	"github.com/JHelar/PiggySplit.git/internal/stream"
)

type ApiContext struct {
	DB   *db.DB
	Pool *stream.ConnectionPool
}

func NewContext(
	db *db.DB,
	pool *stream.ConnectionPool,
) *ApiContext {
	return &ApiContext{
		DB:   db,
		Pool: pool,
	}
}
