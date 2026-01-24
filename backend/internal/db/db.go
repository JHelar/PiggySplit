package db

import (
	"context"
	"database/sql"
	"log"
	"os"
	"path/filepath"

	"github.com/JHelar/PiggyPay.git/internal/db/generated"

	_ "embed"

	_ "github.com/mattn/go-sqlite3"
)

const DATABASE_NAME = "piggysplit.db"

//go:embed schema/schema.sql
var ddl string

type DB struct {
	Queries *generated.Queries
	db      *sql.DB
}

func New() *DB {
	dbPath := os.Getenv("PIGGYSPLIT_DB")
	if len(dbPath) == 0 {
		dbPath = DATABASE_NAME
	}

	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal("Failed to open database", err)
	}

	if _, err := db.ExecContext(ctx, ddl); err != nil {
		log.Fatal("Failed to update schema", err)
	}

	return &DB{
		Queries: generated.New(db),
		db:      db,
	}
}

func (db *DB) RunAsTransaction(ctx context.Context, queries func(*generated.Queries) error) error {
	tx, err := db.db.BeginTx(ctx, &sql.TxOptions{
		Isolation: sql.LevelDefault,
		ReadOnly:  false,
	})
	if err != nil {
		return err
	}
	defer func() {
		_ = tx.Rollback()
	}()

	qtx := db.Queries.WithTx(tx)
	if err := queries(qtx); err != nil {
		return err
	}

	return tx.Commit()
}
