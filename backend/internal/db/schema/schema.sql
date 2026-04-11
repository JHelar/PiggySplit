-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trial_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    user_id INTEGER UNIQUE,
    email TEXT UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_refresh_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_session_id TEXT UNIQUE NOT NULL,


    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,

    FOREIGN KEY (user_session_id) REFERENCES user_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_sign_in_tokens (
    email TEXT NOT NULL UNIQUE PRIMARY KEY,
    code INTEGER NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    display_name TEXT NOT NULL,
    state TEXT NOT NULL,
    color_theme TEXT NOT NULL,
    currency_code TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    
    name TEXT NOT NULL,
    cost REAL NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    state TEXT NOT NULL,
    role TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS group_member_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    total_dept REAL NOT NULL,
    current_dept REAL NOT NULL,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS group_member_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    from_receipt_id INTEGER NOT NULL,
    to_receipt_id INTEGER NOT NULL,

    state TEXT NOT NULL,
    amount REAL NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payed_at TIMESTAMP,

    FOREIGN KEY (from_receipt_id) REFERENCES group_member_receipts(id),
    FOREIGN KEY (to_receipt_id) REFERENCES group_member_receipts(id)
);

CREATE TRIGGER prevent_expense_insert_on_archived_group
BEFORE INSERT ON group_expenses
FOR EACH ROW
WHEN (
    SELECT state FROM groups WHERE id = NEW.group_id
) = 'group_state:archived'
BEGIN
    SELECT RAISE(FAIL, 'Cannot add expenses to an archived group');
END;

CREATE TRIGGER prevent_expense_update_on_archived_group
BEFORE UPDATE ON group_expenses
FOR EACH ROW
WHEN (
    SELECT state FROM groups WHERE id = OLD.group_id
) = 'group_state:archived'
BEGIN
    SELECT RAISE(FAIL, 'Cannot modify expenses of an archived group');
END;


CREATE TRIGGER prevent_update_on_archived_groups
BEFORE UPDATE ON groups
FOR EACH ROW
WHEN OLD.state = 'group_state:archived'
BEGIN
    SELECT RAISE(FAIL, 'Cannot modify an archived group');
END;