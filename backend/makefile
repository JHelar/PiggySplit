.PHONY: schema
schema:
	@echo "🔄 Generating Go code from SQL schema..."
	@sqlc generate || (echo "❌ sqlc failed!" && exit 1)
	@echo "✅ sqlc generation complete."

.PHONY: run
run:
	set -a && . ./.env && go run ./cmd/server/main.go

.PHONY: build
build:
	@echo "🔄 Building image..."
	docker buildx build \
	--platform linux/amd64 \
	-t ghcr.io/jhelar/piggysplit:latest \
	--push .
	@echo "✅ Image built"