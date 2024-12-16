import React from 'react';
import { Trans } from 'react-i18next';
import { Pagination, PaginationVariant, Spinner } from '@patternfly/react-core';

import { PAGE_SIZE } from '../../constants';
import { PaginationDetails } from '../../hooks/useTablePagination';
import { useTranslation } from '../../hooks/useTranslation';

const PaginationTemplate = ({
  currentPage,
  itemCount,
  isUpdating,
}: {
  currentPage: number;
  itemCount: number;
  isUpdating: boolean;
}) => {
  const { t } = useTranslation();
  const totalPages = String(Math.ceil((itemCount || 0) / PAGE_SIZE));

  const pageNum = `${currentPage}`;
  return (
    <>
      {isUpdating && <Spinner size="sm" />}{' '}
      <Trans t={t}>
        {pageNum} of <strong>{totalPages}</strong>
      </Trans>
    </>
  );
};

const TablePagination = ({
  isUpdating,
  pagination,
}: {
  pagination: Pick<PaginationDetails, 'currentPage' | 'setCurrentPage' | 'itemCount'>;
  isUpdating: boolean;
}) => {
  const { t } = useTranslation();
  const { itemCount, currentPage, setCurrentPage } = pagination;

  const [prevCount, setPrevCount] = React.useState<number>(0);
  const [prevCurrentPage, setPrevCurrentPage] = React.useState<number>(0);

  React.useEffect(() => {
    if (!isUpdating) {
      setPrevCount(itemCount || 0);
      setPrevCurrentPage(currentPage);
    }
  }, [isUpdating, itemCount, currentPage]);

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <Pagination
      isDisabled={isUpdating}
      widgetId="table-pagination"
      isCompact
      variant={PaginationVariant.top}
      toggleTemplate={() => (
        <PaginationTemplate isUpdating={isUpdating} itemCount={prevCount} currentPage={currentPage} />
      )}
      itemCount={prevCount}
      perPage={PAGE_SIZE}
      page={prevCurrentPage}
      perPageOptions={[{ title: t(`{{ numberOfItems }} items`, { numberOfItems: PAGE_SIZE }), value: PAGE_SIZE }]}
      onSetPage={onSetPage}
    />
  );
};

export default TablePagination;
