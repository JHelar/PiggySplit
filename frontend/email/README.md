# Piggy split email

Email template builder for generating email templates, this is mainly used to create the html template for the email verification code email.

## Installation

```bash
$ bun install
```

## Starting dev server

Start the dev server
```bash
$ bun dev
```

Edit the email in [verification.tsx](./emails/verification.tsx)

## Export to the templates backend

Build and export the template to the backend

```bash
$ bun export
```

This will build and output the html template file to the backend [verification.html](../../backend/templates/verification.html). It will ensure to inject the correct golang template strings for the code and backend url.