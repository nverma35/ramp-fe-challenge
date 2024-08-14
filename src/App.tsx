import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee } from "./utils/types";

export function App() {
  const { data: employees, loading: employeesLoading, ...employeeUtils } = useEmployees();
  const { data: paginatedTransactions, loading: transactionsLoading, ...paginatedTransactionsUtils } = usePaginatedTransactions();
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee();

  const [transactionStates, setTransactionStates] = useState<{ [transactionId: string]: boolean }>({});

  const transactions = useMemo(
      () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
      [paginatedTransactions, transactionsByEmployee]
  );

  const handleApprovalChange = useCallback(
      (transactionId: string, newValue: boolean) => {
        setTransactionStates((prevState) => ({
          ...prevState,
          [transactionId]: newValue,
        }));
      },
      []
  );

  const loadAllTransactions = useCallback(async () => {
    transactionsByEmployeeUtils.invalidateData();

    await employeeUtils.fetchAll();
    await paginatedTransactionsUtils.fetchAll();
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]);

  const loadTransactionsByEmployee = useCallback(
      async (employeeId: string) => {
        paginatedTransactionsUtils.invalidateData();
        await transactionsByEmployeeUtils.fetchById(employeeId);
      },
      [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  );

  useEffect(() => {
    if (employees === null && !employeesLoading) {
      loadAllTransactions();
    }
  }, [employeesLoading, employees, loadAllTransactions]);

  return (
      <Fragment>
        <main className="MainContainer">
          <Instructions />

          <hr className="RampBreak--l" />

          <InputSelect<Employee>
              isLoading={employeesLoading} // Only show loading when employees are being fetched
              defaultValue={EMPTY_EMPLOYEE}
              items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
              label="Filter by employee"
              loadingLabel="Loading employees"
              parseItem={(item) => ({
                value: item.id,
                label: `${item.firstName} ${item.lastName}`,
              })}
              onChange={async (newValue) => {
                if (newValue === null) {
                  return;
                }

                await loadTransactionsByEmployee(newValue.id);
              }}
          />

          <div className="RampBreak--l" />

          <div className="RampGrid">
            <Transactions
                transactions={transactions}
                transactionStates={transactionStates}
                onApprovalChange={handleApprovalChange}
            />

            {transactions !== null && paginatedTransactions?.nextPage !== null && transactionsByEmployee === null && (
                <button
                    className="RampButton"
                    disabled={transactionsLoading} // Disable button when transactions are loading
                    onClick={async () => {
                      await loadAllTransactions();
                    }}
                >
                  View More
                </button>
            )}
          </div>
        </main>
      </Fragment>
  );
}
