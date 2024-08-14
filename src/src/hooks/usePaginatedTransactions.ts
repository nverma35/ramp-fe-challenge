import { useCallback, useState } from "react";
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types";
import { PaginatedTransactionsResult } from "./types";
import { useCustomFetch } from "./useCustomFetch";

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch();
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<Transaction[]> | null>(null);

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    );

    setPaginatedTransactions((previousResponse) => {
      if (response === null) {
        return previousResponse; // Keep the previous state if the response is null
      }

      if (previousResponse === null) {
        return response; // If there was no previous data, just use the current response
      }

      // If nextPage is null, it means all transactions are loaded, and the button should disappear
      return {
        data: [...(previousResponse.data || []), ...response.data], // Append new data to existing data
        nextPage: response.nextPage,
      };
    });
  }, [fetchWithCache, paginatedTransactions]);

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null);
  }, []);

  return { data: paginatedTransactions, loading, fetchAll, invalidateData };
}
