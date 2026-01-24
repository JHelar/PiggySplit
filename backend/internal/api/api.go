package api

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app fiber.Router, context *ApiContext) {
	app.Get("/", func(ctx *fiber.Ctx) error {
		return helloWorld(ctx, context)
	}).Name("helloWorld")

	groupRouter := app.Group("/groups")
	registerGroupRoutes(groupRouter, context)

	userRouter := app.Group("/user")
	registerUserRoutes(userRouter, context)
}

func helloWorld(ctx *fiber.Ctx, context *ApiContext) error {
	return ctx.SendString("Hello PiggyPay")
}
