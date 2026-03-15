# Piggy split backend

### Running
#### Setup

Project is built in a GNU compatible environment, thus it makes an assumption that following tools are available:
- make
- gcc

Language setup
- Ensure golang is available, otherwise [install it](https://go.dev/dl/)

#### Sending email
Email verification codes are sent via a set smtp connection to [Gmail SMTP Option](https://knowledge.workspace.google.com/admin/gmail/send-email-from-a-printer-scanner-or-app?hl=en&visit_id=639091628173789258-3003602533&rd=1#gmail-smtp-option), if you want to test sending emails you will have to set it up via your own gmail credentials.

```bash
$ cp .env.template .env
```

Set the following fields with your own gmail credentials:
```.env
AUTH_EMAIL=
AUTH_EMAIL_PASSWORD=
```

### Running locally
Run the following make command to start the server locally on [127.0.0.1:8080](127.0.0.1:8080)
```bash
$ make run
```

