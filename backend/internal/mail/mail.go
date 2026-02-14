package mail

import (
	"bytes"
	"html/template"
	"net/smtp"
	"os"
)

var VerificationTemplate = template.Must(template.ParseFiles("templates/verification.html"))

func SendVerificationEmail(toEmail string, code string) error {
	var sb bytes.Buffer

	if err := VerificationTemplate.Execute(&sb, struct {
		VerificationCode string
		BaseUrl          string
	}{VerificationCode: code, BaseUrl: "https://192.168.50.202:8080"}); err != nil {
		return err
	}

	auth := smtp.PlainAuth(
		"",
		os.Getenv("AUTH_EMAIL"),
		os.Getenv("AUTH_EMAIL_PASSWORD"),
		os.Getenv("AUTH_EMAIL_SMTP_HOST"),
	)

	headers := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";"
	message := "Subject: Piggy Split, Verification code\n" + headers + "\n\n" + sb.String()

	return smtp.SendMail(
		os.Getenv("AUTH_EMAIL_SMTP_ADDRESS"),
		auth,
		os.Getenv("AUTH_EMAIL"),
		[]string{toEmail},
		[]byte(message),
	)
}
