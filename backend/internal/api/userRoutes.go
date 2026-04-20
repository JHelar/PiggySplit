package api

import (
	"github.com/gofiber/fiber/v2"
)

func registerUserRoutes(app fiber.Router, api *ApiContext) {
	app.Use([]string{"/create", "/me", "/sse"}, func(c *fiber.Ctx) error {
		return verifyUserSession(c, api)
	})

	app.Post("/signIn", func(ctx *fiber.Ctx) error {
		return newUserSignIn(ctx, api)
	}).Name("newUserSignIn")

	app.Get("/signIn", func(ctx *fiber.Ctx) error {
		return verifyUserSignIn(ctx, api)
	}).Name("verifyUserSignIn")

	app.Get("/signOut", func(ctx *fiber.Ctx) error {
		return signOut(ctx, api)
	}).Name("signOut")

	app.Post("/create", func(ctx *fiber.Ctx) error {
		return createNewUser(ctx, api)
	}).Name("createNewUser")

	app.Post("/trial", func(ctx *fiber.Ctx) error {
		return newTrialSignIn(ctx, api)
	}).Name("createTrialUser")

	app.Get("/me", func(ctx *fiber.Ctx) error {
		return getUser(ctx, api)
	}).Name("getUser")

	app.Patch("/me", func(ctx *fiber.Ctx) error {
		return updateUser(ctx, api)
	}).Name("updateUser")

	app.Delete("/me", func(ctx *fiber.Ctx) error {
		return deleteUser(ctx, api)
	}).Name("deleteUser")

	app.Get("/sse", func(ctx *fiber.Ctx) error {
		return userStream(ctx, api)
	}).Name("stream")
}
