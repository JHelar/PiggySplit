# Piggy split backend

Go lang backend for the Piggy Split application.

## Architecture

It is an ever evolving project so the backend themes and architecture can vary depending on the needs of the application it self. Considerations such as best practices and the likes has not been something that has been a focus for the project. 

Mostly I have used this as an outlet learn to code in golang and also as a fun project where guidelines and frameworks are not needed. If this would ever evolve into something that would require more developers to join, I would most likely restructure it so that it adheres to more common structures and best practices for golang projects.

**Overview**
```
┌─cmd
|
├─internal
|    |
|    ├─ api
|    |       
|    ├─ db 
|    |
|    ├─ mail
|    |
|    ├─ server
|    |
|    └─ utils
|
├── public
|
└── templates
```

- `cmd` directory for the main entry point of the server program
- `internal` directory for internal logic used by the server
- `api` the main directory for the api layer, includes business logic and routing for the REST api that the application consumes
- `db` main directory for all sqlite database queries and schemas, generated query files from sqlc is also added here
- `mail` directory for the mail sending module, currently rudimentary implementation using std libraries to send emails to a gmail smtp server
- `server` directory for the sse stream implementation, manual implementation of a client pool and connection manager
- `utils` directory for misc utilities, currently only the function to balance out transaction receipts resides here
- `public` directory for public assets
- `templates` directory for any html templates to be used in email send-outs, these templates uses the golang compatible template syntax

### Routing

The project uses the go package fiber to more easily work with routing and route middlewares used for authentication verification and route context api.

### Database

The database is a simple SQLite database with the foreign key support enabled. It uses sqlc in order to generate golang queries from sql schema files. This is an optimization so that I do not need to manually write sql queries and model structs from scratch.

### Authentication

Authentication is done via email code tokens sent to a given email. The Email address is the identifier for an user. Session tokens are short lived whilst the refresh token (if available in the request) will ensure sessions can last longer without having to reauthenticate.

The auth middleware will reroll the session and refresh token if the session has expired and the refresh token is valid. This is done in the [verifyUserSession](./internal/api/auth.go) route middleware

## Running
### Setup

Project is built in a GNU compatible environment, thus it makes an assumption that following tools are available:
- make
- gcc

Language setup
- Ensure golang is available, otherwise [install it](https://go.dev/dl/)

### Sending email
Email verification codes are sent via a set smtp connection to [Gmail SMTP Option](https://knowledge.workspace.google.com/admin/gmail/send-email-from-a-printer-scanner-or-app?hl=en&visit_id=639091628173789258-3003602533&rd=1#gmail-smtp-option), if you want to test sending emails you will have to set it up via your own gmail credentials.

```bash
$ cp .env.template .env
```

Set the following fields with your own gmail credentials:
```.env
AUTH_EMAIL=
AUTH_EMAIL_PASSWORD=
```

### Start backend
Run the following make command to start the server locally on [127.0.0.1:8080](127.0.0.1:8080)
```bash
$ make run
```

### DB Schema generation

The project uses the sqlc package to generate go compatible query execution code. 
All sql queries are written and placed in the `/internal/db/queries` directory.

When making changes to a query generate the golang query code: 
```bash
$ make schema
```


