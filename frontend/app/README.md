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