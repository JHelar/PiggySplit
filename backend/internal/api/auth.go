package api

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	"github.com/JHelar/PiggySplit.git/internal/db/generated"
	"github.com/JHelar/PiggySplit.git/internal/mail"
	"github.com/gofiber/fiber/v2"
)

const (
	HeaderRefresh = "PS-Refresh"
	HeaderToken   = "PS-Token"
)

type UserSession struct {
	Bearer  string `reqHeader:"Authorization"`
	Refresh string `reqHeader:"PS-Refresh"`
}

const SESSION_EXPIRE_TIME = time.Minute * 10
const REFRESH_SESSION_EXPIRE_TIME = time.Hour * 24 * 365 // Year long refresh token
const SIGN_IN_TOKEN_EXPIRE_TIME = time.Minute * 10

const BEARER = "Bearer "
const USER_SESSION_LOCAL = "userSession"

func verifyUserSession(c *fiber.Ctx, api *ApiContext) error {
	db := api.DB
	ctx := context.Background()
	header := new(UserSession)

	if err := c.ReqHeaderParser(header); err != nil {
		return err
	}

	if len(header.Bearer) == 0 {
		log.Printf("Missing token on route %s", string(c.Request().URI().FullURI()))
		return fiber.ErrUnauthorized
	}

	sessionId, ok := strings.CutPrefix(header.Bearer, BEARER)
	if !ok || len(sessionId) == 0 {
		log.Println("Missing Bearer token")
	}

	session, err := db.Queries.GetUserSessionById(ctx, sessionId)
	if err != nil && err == sql.ErrNoRows {
		log.Printf("Missing Session: %s\n", sessionId)
		return fiber.ErrUnauthorized
	}

	if err != nil {
		return fiber.ErrInternalServerError
	}

	if session.ExpiresAt.Before(time.Now()) {

		log.Printf("Session expired: %s\n", sessionId)

		refresh, refreshErr := db.Queries.GetUserRefreshSessionById(ctx, header.Refresh)

		if err := db.Queries.DeleteUserSessionById(ctx, sessionId); err != nil {
			log.Println(err)
		}
		if refreshErr != nil {
			log.Printf("Missing refresh token")
			return fiber.ErrUnauthorized
		}

		// Refresh the refresh token on every use, in other words delete it independent on outcome
		db.Queries.DeleteUserRefreshSessionById(ctx, refresh.ID)
		if refresh.UserSessionID != sessionId {
			// If refresh token references the incorrect session id, return
			log.Printf("Invalid refresh token")
			return fiber.ErrUnauthorized
		}
		if refresh.ExpiresAt.Before(time.Now()) {
			log.Printf("Refresh token expired")
			return fiber.ErrUnauthorized
		}

		// Refresh session and token
		log.Println("Refreshing session and token")
		newUserSessionId, err := db.Queries.CreateNewUserSession(ctx, generated.CreateNewUserSessionParams{
			UserID:    session.UserID,
			Email:     session.Email,
			ExpiresAt: time.Now().Add(SESSION_EXPIRE_TIME),
		})
		if err != nil {
			log.Println(err.Error())
			return fiber.ErrUnauthorized
		}
		newRefreshToken, err := db.Queries.CreateNewUserRefreshSession(ctx, generated.CreateNewUserRefreshSessionParams{
			UserSessionID: newUserSessionId,
			ExpiresAt:     time.Now().Add(REFRESH_SESSION_EXPIRE_TIME),
		})
		if err != nil {
			log.Println(err.Error())
			return fiber.ErrUnauthorized
		}

		c.Response().Header.Add(HeaderRefresh, newRefreshToken)
		c.Response().Header.Add(HeaderToken, newUserSessionId)
	}

	log.Printf("Session found: (Email: %s, UserId: %d)\n", session.Email.String, session.UserID.Int64)
	c.Locals(USER_SESSION_LOCAL, session)
	return c.Next()
}

func mustGetUserSession(c *fiber.Ctx) generated.GetUserSessionByIdRow {
	return c.Locals(USER_SESSION_LOCAL).(generated.GetUserSessionByIdRow)
}

func generateSignInCode() int64 {
	return 10000 + rand.Int63n(89999)
}

type NewUserSignIn struct {
	Email string `json:"email" xml:"email" form:"email"`
}

func newUserSignIn(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()
	payload := new(NewUserSignIn)

	if err := c.BodyParser(payload); err != nil {
		return err
	}

	expires_at, err := api.DB.Queries.GetSignInTokenExpiry(ctx, payload.Email)
	if err == nil {
		if expires_at.After(time.Now()) {
			log.Printf("User already has an active token")
			return fiber.NewError(fiber.ErrBadRequest.Code, "Email already sent")
		}
		// Delete the expired token
		log.Printf("Deleting expired code")
		api.DB.Queries.GetSignInToken(ctx, payload.Email)
	}

	code := generateSignInCode()

	expires := time.Now().Add(SESSION_EXPIRE_TIME)

	if err := api.DB.Queries.CreateSignInToken(ctx, generated.CreateSignInTokenParams{
		Email:     strings.ToLower(payload.Email),
		Code:      code,
		ExpiresAt: expires,
	}); err != nil {
		return err
	}

	log.Printf("Sign in created: code(%d) email(%s)", code, payload.Email)
	if err := mail.SendVerificationEmail(payload.Email, fmt.Sprint(code)); err != nil {
		log.Printf("Error sending email: %v", err)
		return fiber.DefaultErrorHandler(c, err)
	}
	return c.SendString("Email verification code sent")
}

func verifyUserSignIn(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()
	db := api.DB
	email := c.Query("email")
	code := c.Query("code")

	log.Printf("Verifying email(%s) code(%s)", email, code)

	signInToken, err := db.Queries.GetSignInToken(ctx, email)

	if err != nil {
		log.Printf("verifyUserSignIn error getting sign in token email(%s)", email)
		return fiber.ErrUnauthorized
	}

	if signInToken.ExpiresAt.Before(time.Now()) {
		log.Println("token has expired")
		return fiber.ErrUnauthorized
	}

	if fmt.Sprint(signInToken.Code) != code {
		log.Printf("invalid code(%s) expected(%d)", code, signInToken.Code)
		return fiber.ErrUnauthorized
	}

	user, err := db.Queries.GetUserByEmail(ctx, signInToken.Email)

	expires := time.Now().Add(SESSION_EXPIRE_TIME)
	var isNewUser bool
	var session string

	if err == sql.ErrNoRows {
		// New user session
		isNewUser = true
		session, err = db.Queries.CreateNewUserSession(ctx, generated.CreateNewUserSessionParams{
			Email:     sql.NullString{Valid: true, String: signInToken.Email},
			UserID:    sql.NullInt64{Valid: false},
			ExpiresAt: expires,
		})
	} else {
		isNewUser = false
		session, err = db.Queries.CreateExistingUserSession(ctx, generated.CreateExistingUserSessionParams{
			Email:     sql.NullString{Valid: false},
			UserID:    sql.NullInt64{Valid: true, Int64: user.ID},
			ExpiresAt: expires,
		})
	}

	if err != nil {
		log.Printf("Error (%v) verify user sign in", err.Error())
		return fiber.ErrUnauthorized
	}

	log.Printf("New session(%s) created", session)

	newRefreshToken, err := db.Queries.CreateNewUserRefreshSession(ctx, generated.CreateNewUserRefreshSessionParams{
		UserSessionID: session,
		ExpiresAt:     time.Now().Add(REFRESH_SESSION_EXPIRE_TIME),
	})
	if err != nil {
		log.Println(err.Error())
		return fiber.ErrUnauthorized
	}
	if err != nil {
		log.Printf("Error creating refresh token (%v) verify user sign in", err.Error())
		return fiber.ErrUnauthorized
	}

	c.Response().Header.Add(HeaderRefresh, newRefreshToken)
	c.Response().Header.Add(HeaderToken, session)

	return c.JSON(fiber.Map{
		"session":  session,
		"new_user": isNewUser,
	})
}

func signOut(c *fiber.Ctx, api *ApiContext) error {
	ctx := context.Background()
	if err := verifyUserSession(c, api); err != nil {
		return c.SendString("Nothing to sign out")
	}

	session := mustGetUserSession(c)
	db := api.DB
	if err := db.Queries.DeleteUserSessionById(ctx, session.ID); err != nil {
		log.Printf("error signOut %v", err.Error())
	}
	return c.SendString("Successfully signed out")
}
