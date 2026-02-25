-- name: CreateReceipt :one
INSERT INTO group_member_receipts (group_id, user_id, total_dept, current_dept) VALUES (?, ?, ?, ?)
    RETURNING *;

-- name: UpdateReceiptDeptById :one
UPDATE group_member_receipts
SET current_dept=current_dept+@amount,updated_at=CURRENT_TIMESTAMP
WHERE id=@receipt_id
RETURNING *;
