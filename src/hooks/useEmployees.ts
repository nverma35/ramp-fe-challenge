import { useCallback, useState } from "react";
import { Employee } from "../utils/types";
import { useCustomFetch } from "./useCustomFetch";
import { EmployeeResult } from "./types";

export function useEmployees(): EmployeeResult {
  const { fetchWithCache } = useCustomFetch();
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [employeeLoading, setEmployeeLoading] = useState(false); // New state for managing employee loading

  const fetchAll = useCallback(async () => {
    setEmployeeLoading(true); // Set loading to true when fetching starts
    const employeesData = await fetchWithCache<Employee[]>("employees");
    setEmployees(employeesData);
    setEmployeeLoading(false); // Set loading to false once fetching is done
  }, [fetchWithCache]);

  const invalidateData = useCallback(() => {
    setEmployees(null);
  }, []);

  return { data: employees, loading: employeeLoading, fetchAll, invalidateData };
}
