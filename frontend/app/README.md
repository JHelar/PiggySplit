# Piggy split app frontend

The Piggy split native application, built with React native and Expo.

## Setup

> ℹ️ Only the iOS platform is currently available, it will build for Android but UI has not been adapted for the platform as of yet.

### Prerequisites

- Ensure to have bun available globally: https://bun.com/
- Setup local environment
```bash
$ cp .env.template .env.local
```

In the `.env`- file, set the `EXPO_PUBLIC_API_URL` with the url for the local backend

### Installation

Install dependencies

```bash
$ bun install
```

**Development client** is required, this is because the application uses native libraries that are not available in the Expo Go application.

> ⚠️ In order to run the build successfully, node v20+ needs to be available in the global context as well

Following command will try and build and start the development client for iOS simulator

```bash
$ bun client:ios
```

### Start development server

```bash
$ bun start
```

## Architecture

The overall structure for the project focuses on centralizing and encompassing features to a single directory, keeping reused functions and UI to a globally accessible directory. This way cross contamination between features is as minimal as possible. 

### Allowing operations outside React context

This is a mental model that I like to apply whenever I do something in React. 
I should not be forced to be inside a React context in order to affect the application state, navigation or function.

By ensuring this throughout the application, you get a much simpler and better DX, a better DX leads to less frustration, better quality and result.

### State management

State management in react in general is a hot potato, but I usually want to keep it as simple as possible with as little global store as possible.

#### `zustand`
Zustand is a great little library that allows us to create globally accessible store state without being forced to be in a react context to access the state. 

A store should be a minimal unit that only encompasses a single feature, it should not have multiple use cases, doing this allows us to more easily refactor the feature if needed without having too many dependencies.

**use cases**
- auth, the `auth.store.ts` contains the centralized persisted store for the auth handling in the app. No other consumer or dependency is allowed to hold the auth state.
- signIn, `SignIn.store.ts` another type of isolated store that contains all logic to sign a user in to the application. It uses a small implementation of a state machine to guide the user through the sign in flow. State machines are a great tool to have when you have a user flow with branching logic depending of transition results.

### `tanstack/query`
The other type of state management is the use of client caching and server state. This is in my opinion the best way to have a maintained global state without encountering issues with keeping server and client state in sync. 

This replaces any need of global `Context` or other global store state implementations.

### SSE

A sse connection is established when a user signs in to the application. This stream is used for any events that happens on resources that the user is entitled to such as:
- Group updates
- Payment updates
- Expense crud operations

This allows us to seamlessly update the UI without having to resort to http polling.

### Structure

**Overview**
```
┌─ api
|
├─ app
|
├─ auth
|
├─ components
|
├─ hooks
|
├─ i18n
|
├─ query
|
├─ schemas
|
├─ screens
|
├─ ui
|
└─ utils

```
