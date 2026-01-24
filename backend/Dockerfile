# ---------- Build stage ----------
FROM alpine:edge AS build
RUN apk add --no-cache --update go gcc g++

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build the server binary
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 \
    go build -o server ./cmd/server

# ---------- Runtime stage ----------
FROM alpine:3.19

WORKDIR /app

# Copy the binary
COPY --from=build /app/server /app/server

# Ensure the data directory
RUN mkdir -p /data && chown -R 568:568 /data

# Run as non-root inside container
USER 568:568

EXPOSE 8080

ENTRYPOINT ["/app/server"]
