import { useCallback } from "react";
import { useCustomFetch } from "src/hooks/useCustomFetch";
import { SetTransactionApprovalParams } from "src/utils/types";
import { TransactionPane } from "./TransactionPane";
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types";

export const Transactions: TransactionsComponent = ({ transactions, transactionStates, onApprovalChange }) => {
  const { fetchWithoutCache, loading } = useCustomFetch();

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
      async ({ transactionId, newValue }) => {
        await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
          transactionId,
          value: newValue,
        });
        onApprovalChange(transactionId, newValue); // Update global state
      },
      [fetchWithoutCache, onApprovalChange]
  );

  // Handle the case where transactions is null, undefined, or an empty array
  if (!transactions || transactions.length === 0) {
    return <div className="RampLoading--container">No transactions available</div>;
    // Display a fallback UI when no transactions are available
  }

  return (
      <div data-testid="transaction-container">
        {transactions.map((transaction) => (
            <TransactionPane
                key={transaction.id}
                transaction={transaction}
                loading={loading}
                setTransactionApproval={setTransactionApproval}
                transactionStates={transactionStates}
            />
        ))}
      </div>
  );
};
