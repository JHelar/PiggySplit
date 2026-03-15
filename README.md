# Piggy split

Application for splitting group expenses

## Design

You can read up on the UX UI design thoughts and ideas in the [DESIGN.md](./DESIGN.md)

## Backend

Backend is written in golang, setup and more information can be found in [README.md](./backend/README.md)

### Run locally

```bash
$ cd backend
$ make run
```
 
## Frontend app

The frontend is an native application written in react-native with Expo as a layer to orchestrate routing and building, setup and more information can be found in the app [README.md](./frontend/app/README.md)

### Run locally

```bash
$ cd frontend/app
$ bun client:ios
```

## Email template generator

The template for the verification email is generated from the email app, read more on that in the [README.md](./frontend/email/README.md)