import { useState } from "react";
import { InputCheckbox } from "../InputCheckbox";
import { TransactionPaneComponent } from "./types";

export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  setTransactionApproval: consumerSetTransactionApproval,
}) => {
  console.log(transaction);

  const [approved, setApproved] = useState(transaction.approved ?? false);

  // Ensure the transaction object is valid before using it
  if (
    !transaction || 
    !transaction.employee || 
    !transaction.employee.id || 
    transaction.approved === undefined
  ) {
    console.error("Invalid transaction or employee data:", transaction);
    return <div>Error: Invalid transaction or employee data</div>; // Fallback UI or error message
  }

  

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant} </p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox
        id={transaction.id}
        checked={approved}
        disabled={loading}
        onChange={async (newValue) => {
          await consumerSetTransactionApproval({
            transactionId: transaction.id,
            newValue,
          });

          setApproved(newValue);
        }}
      />
    </div>
  );
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
