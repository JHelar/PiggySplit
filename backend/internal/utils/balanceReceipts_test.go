package utils

import (
	"testing"

	"github.com/JHelar/PiggySplit.git/internal/db/generated"
)

func TestBalanceReceipts(t *testing.T) {
	var receipts = []generated.CreateReceiptRow{
		{
			ID:        1,
			TotalDept: -40,
		},
		{
			ID:        2,
			TotalDept: 160,
		},
		{
			ID:        3,
			TotalDept: 460,
		},
		{
			ID:        4,
			TotalDept: -240,
		},
		{
			ID:        5,
			TotalDept: -340,
		},
	}

	transactions, err := BalanceReceipts(receipts)
	if err != nil {
		t.Error(err)
	}

	sum := 0.0
	for _, transaction := range transactions {
		sum += transaction.Cost
	}

	if sum != 620 {
		t.Errorf("expected sum %v got %v", 620, sum)
	}
}
