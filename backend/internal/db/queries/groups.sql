-- name: GetGroupsByUserId :many
SELECT
    g.id AS id,
    g.display_name AS group_name,
    g.state AS group_state,
    g.color_theme AS group_theme,
    g.created_at AS created_at,
    g.updated_at AS updated_at,

    IFNULL(SUM(e.cost), 0.0) AS total_expenses,
    IFNULL(SUM(e.cost), 0.0) / COUNT(DISTINCT m.user_id) AS pay_per_member
FROM groups g
INNER JOIN group_members gm
    ON gm.group_id = g.id
LEFT JOIN group_expenses e
    ON e.group_id = g.id
LEFT JOIN group_members m
    ON m.group_id = g.id
WHERE gm.user_id = ?
  AND g.state != 'group_state:archived'
GROUP BY g.id
ORDER BY gm.created_at DESC;

-- name: CreateGroup :one
INSERT INTO groups (display_name, state, color_theme) VALUES (?, ?, ?)
    RETURNING id, display_name, state, color_theme, created_at, updated_at;

-- name: UpdateGroupById :one
UPDATE groups
    SET 
        display_name=?,
        color_theme=?,
        updated_at=CURRENT_TIMESTAMP
    WHERE id = (
        SELECT groups.id
        FROM groups
        INNER JOIN group_members 
            ON group_members.group_id=groups.id
        WHERE groups.id=? AND group_members.user_id=?
    )
    RETURNING id, display_name, state, color_theme, created_at, updated_at;

-- name: UpdateGroupState :exec
UPDATE groups
    SET
        state=?,
        updated_at=CURRENT_TIMESTAMP
    WHERE id = (
        SELECT groups.id
        FROM groups
        INNER JOIN group_members 
            ON group_members.group_id=groups.id
        WHERE groups.id=? AND group_members.user_id=?
    );

-- name: GetGroupForUserById :one
SELECT g.id AS id,
    g.display_name AS group_name,
    g.state AS group_state,
    g.color_theme AS group_theme,
    g.created_at AS created_at,
    g.updated_at AS updated_at,
    gm.role AS member_role,
    gm.state AS member_state,
    IFNULL(SUM(e.cost), 0.0) AS total_expenses,
    IFNULL(
        SUM(e.cost) / NULLIF(COUNT(DISTINCT m.user_id), 0),
        0.0
    ) AS pay_per_member,

    IFNULL(
        SUM(CASE WHEN e.user_id = gm.user_id THEN e.cost ELSE 0 END),
        0.0
    ) AS member_contribution

    FROM groups g
    INNER JOIN group_members gm
        ON gm.group_id = g.id
    LEFT JOIN group_expenses e
        ON e.group_id = g.id
    LEFT JOIN group_members m
        ON m.group_id = g.id
    WHERE gm.user_id = ?
        AND g.state != 'group_state:archived'
        AND g.id=?
    GROUP BY g.id, gm.user_id
    LIMIT 1;

-- name: UpdateGroupStateById :exec
UPDATE groups
SET state = @group_state, updated_at = CURRENT_TIMESTAMP
WHERE id = @group_id;

-- name: ArchiveGroupById :exec
UPDATE groups
SET state = "group_state:archived", updated_at = CURRENT_TIMESTAMP
    WHERE id IN (
        SELECT groups.id
        FROM groups
        INNER JOIN group_members
            ON groups.id=group_members.group_id
        WHERE groups.id=@group_id AND group_members.role=@member_role AND group_members.user_id=@user_id
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