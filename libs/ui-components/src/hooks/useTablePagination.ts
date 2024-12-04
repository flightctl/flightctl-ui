import * as React from 'react';
import { ApiList } from '../utils/api';
import { PAGE_SIZE } from '../constants';

export const useTablePagination = () => {
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [continueTokens, setContinueTokens] = React.useState<string[]>([]);
  const [itemCount, setItemCount] = React.useState<number>(0);

  const nextContinue = currentPage <= 1 ? '' : continueTokens[currentPage - 2];

  const onPageFetched = React.useCallback(
    (apiList: ApiList<unknown>) => {
      const prevItems = (currentPage - 1) * PAGE_SIZE;
      setItemCount(prevItems + (apiList?.items.length || 0) + (apiList.metadata.remainingItemCount || 0));

      const nextToken = apiList.metadata?.continue || '';
      if (currentPage === 1) {
        // Always reset the list when at first page
        setContinueTokens([nextToken]);
      } else if (continueTokens.length < currentPage) {
        // Visiting current page for the first time
        setContinueTokens((prevList: string[]) => prevList.concat(nextToken));
      } else {
        // Re-visiting current page, token is updated in case the list of items changed
        setContinueTokens((prevList: string[]) =>
          prevList.map((token, index) => (index === currentPage - 1 ? nextToken : token)),
        );
      }
    },
    [setContinueTokens, continueTokens, setItemCount, currentPage],
  );

  return { onPageFetched, currentPage, setCurrentPage, nextContinue, itemCount };
};
