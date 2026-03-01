-- name: CreateSignInToken :exec
INSERT INTO user_sign_in_tokens (email, code, expires_at) VALUES (?, ?, ?)
    ON CONFLICT (email) DO UPDATE SET expires_at=excluded.expires_at;

-- name: GetSignInTokenExpiry :one
SELECT expires_at FROM user_sign_in_tokens
    WHERE email=?;

-- name: GetSignInToken :one
DELETE FROM user_sign_in_tokens
    WHERE email=?
    RETURNING email, code, expires_at;

-- name: CreateNewUserSession :one
INSERT INTO user_sessions (user_id, email, expires_at) VALUES (?, ?, ?)
    ON CONFLICT (user_id) DO UPDATE SET expires_at=excluded.expires_at
    RETURNING id;

-- name: CreateNewUserRefreshSession :one
INSERT INTO user_refresh_sessions (user_session_id, expires_at) VALUES (?, ?)
    ON CONFLICT (user_session_id) DO UPDATE SET expires_at=excluded.expires_at
    RETURNING id;

-- name: CreateExistingUserSession :one
INSERT INTO user_sessions (user_id, email, expires_at) VALUES (?, ?, ?)
    ON CONFLICT (user_id) DO UPDATE SET 
        expires_at=excluded.expires_at
    RETURNING id;

-- name: UpdateUserSession :exec
UPDATE user_sessions
    SET
        expires_at=?,
        email=null,
        user_id=?
    WHERE id=?;

-- name: GetUserSessionById :one
SELECT id, user_id, email, expires_at FROM user_sessions
    WHERE id=?;

-- name: GetUserRefreshSessionById :one
SELECT * FROM user_refresh_sessions
    WHERE id=?;

-- name: DeleteUserSessionById :exec
DELETE FROM user_sessions
    WHERE id=?;

-- name: DeleteUserRefreshSessionById :exec
DELETE FROM user_refresh_sessions
    WHERE id=?;

-- name: GetUserByEmail :one
SELECT * FROM users
    WHERE email=?;

-- name: GetUserById :one
SELECT first_name, last_name, phone_number, email FROM users
    WHERE id=?;

-- name: CreateUser :one
INSERT INTO users (first_name, last_name, phone_number, email) VALUES (?, ?, ?, ?)
    RETURNING first_name, last_name, phone_number, email, id;

-- name: UpdateUser :one
UPDATE users
    SET
        first_name=?,
        last_name=?,
        phone_number=?,
        email=?,
        updated_at=CURRENT_TIMESTAMP
    WHERE users.id=?
    RETURNING first_name, last_name, phone_number, email;

-- name: DeleteUser :exec
DELETE FROM users
    WHERE id=?;