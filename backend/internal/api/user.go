package api

import (
	"context"
	"database/sql"
	"log"
	"strings"
	"time"

	"github.com/JHelar/PiggySplit.git/internal/db/generated"
	"github.com/gofiber/fiber/v2"
)

type CreateNewUser struct {
	FirstName   string `json:"first_name" xml:"first_name" form:"first_name"`
	LastName    string `json:"last_name" xml:"last_name" form:"last_name"`
	PhoneNumber string `json:"phone_number" xml:"phone_number" form:"phone_number"`
}

func createNewUser(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB
	ctx := context.Background()
	payload := new(CreateNewUser)

	if err := c.BodyParser(payload); err != nil {
		return err
	}

	session := mustGetUserSession(c)

	user, err := db.Queries.CreateUser(ctx, generated.CreateUserParams{
		Email:       strings.ToLower(session.Email.String),
		FirstName:   payload.FirstName,
		LastName:    payload.LastName,
		PhoneNumber: payload.PhoneNumber,
	})

	if err != nil {
		log.Printf("createNewUser failed to create user")
		return fiber.DefaultErrorHandler(c, err)
	}

	if err = db.Queries.UpdateUserSession(ctx, generated.UpdateUserSessionParams{
		ID:        session.ID,
		ExpiresAt: time.Now().Add(SESSION_EXPIRE_TIME),
		UserID:    sql.NullInt64{Valid: true, Int64: user.ID},
	}); err != nil {
		log.Printf("createNewUser failed to update user session")
		return fiber.DefaultErrorHandler(c, err)
	}

	return c.JSON(user)
}

func getUser(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()

	session := mustGetUserSession(c)

	user, err := api.DB.Queries.GetUserById(ctx, session.UserID.Int64)
	if err != nil && err == sql.ErrNoRows {
		return fiber.ErrUnauthorized
	}

	if err != nil {
		log.Println(err.Error())
		return fiber.ErrInternalServerError
	}

	return c.JSON(user)
}

type UpdateUser struct {
	FirstName   string `json:"first_name" xml:"first_name" form:"first_name"`
	LastName    string `json:"last_name" xml:"last_name" form:"last_name"`
	PhoneNumber string `json:"phone_number" xml:"phone_number" form:"phone_number"`
	Email       string `json:"email" xml:"email" form:"email"`
}

func updateUser(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()
	payload := new(UpdateUser)

	session := mustGetUserSession(c)
	db := api.DB
	if err := c.BodyParser(payload); err != nil {
		return err
	}

	user, err := db.Queries.UpdateUser(ctx, generated.UpdateUserParams{
		ID:          session.UserID.Int64,
		FirstName:   payload.FirstName,
		LastName:    payload.LastName,
		PhoneNumber: payload.PhoneNumber,
		Email:       strings.ToLower(payload.Email),
	})

	if err != nil {
		log.Printf("updateUser error updating user %v", err.Error())
		return fiber.DefaultErrorHandler(c, err)
	}

	return c.JSON(user)
}

func deleteUser(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()

	session := mustGetUserSession(c)

	if err := api.DB.Queries.DeleteUser(ctx, session.UserID.Int64); err != nil {
		log.Printf("updateUser error deleting user %v", err.Error())
		return fiber.DefaultErrorHandler(c, err)
	}

	if err := api.DB.Queries.DeleteUserSessionById(ctx, session.ID); err != nil {
		log.Printf("updateUser error deleting user session %v", err.Error())
	}

	return c.SendString("Deleted")
}
