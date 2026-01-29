package main

import (
	"log"

	"github.com/JHelar/PiggySplit.git/internal/server"
)

func main() {
	server := server.New()

	log.Println("Starting server...")
	if err := server.Run(":8080"); err != nil {
		log.Fatal("Server failed to start", err)
	}
}
