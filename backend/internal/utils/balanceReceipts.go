package utils

import (
	"cmp"
	"fmt"
	"math"
	"slices"

	"github.com/JHelar/PiggySplit.git/internal/db/generated"
)

type Transaction struct {
	FromID int64
	ToID   int64
	Cost   float64
}

type ReceiptNode struct {
	ID        int64
	TotalDept float64
}

func BalanceReceipts(receipts []generated.CreateReceiptRow) ([]Transaction, error) {
	var nodes []*ReceiptNode
	for _, receipt := range receipts {
		nodes = append(nodes, &ReceiptNode{
			ID:        receipt.ID,
			TotalDept: receipt.TotalDept,
		})
	}

	slices.SortFunc(nodes, func(a *ReceiptNode, b *ReceiptNode) int {
		return cmp.Compare(a.TotalDept, b.TotalDept)
	})

	var transactions []Transaction
	if err := balanceReceipts(0, nodes, &transactions); err != nil {
		return nil, err
	}

	return transactions, nil
}

func balanceReceipts(i int, nodes []*ReceiptNode, transactions *[]Transaction) error {
	if i >= len(nodes) {
		return nil
	}
	min := nodes[i]
	if min.TotalDept > 0 {
		return fmt.Errorf("min is larger than 0 was %f", min.TotalDept)
	}

	for j := len(nodes) - 1; j >= 0; j-- {
		if min.TotalDept == 0 {
			break
		}
		if i == j {
			continue
		}

		max := nodes[j]

		if max.TotalDept < 0 {
			return fmt.Errorf("max is less than 0 was %f", max.TotalDept)
		}
		if max.TotalDept == 0 {
			continue
		}

		transaction := Transaction{
			FromID: min.ID,
			ToID:   max.ID,
		}

		remaining := (min.TotalDept + max.TotalDept)
		if remaining > 0 {
			// Min pays min.TotalDept, max still is owed remaining, min owes nothing
			transaction.Cost = math.Abs(min.TotalDept)

			max.TotalDept = remaining
			min.TotalDept = 0
		} else if remaining < 0 {
			// Min pays max -> max.TotalDept, max is not owed anything, min still owes remaining
			transaction.Cost = max.TotalDept

			max.TotalDept = 0
			min.TotalDept = remaining
		} else {
			transaction.Cost = max.TotalDept
			// Even
			min.TotalDept = 0
			max.TotalDept = 0
		}

		*transactions = append(*transactions, transaction)
	}

	// Min should be exhausted here
	if min.TotalDept != 0 {
		return fmt.Errorf("findTransactions min not exhausted")
	}
	return balanceReceipts(i+1, nodes, transactions)
}
