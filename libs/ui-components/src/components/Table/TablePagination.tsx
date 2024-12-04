import React from 'react';
import { Trans } from 'react-i18next';
import { Pagination, PaginationToggleTemplateProps, PaginationVariant, Spinner } from '@patternfly/react-core';

import { PAGE_SIZE } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';

type TablePaginationProps = {
  isUpdating: boolean;
  itemCount?: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

const PaginationTemplate = ({
  isUpdating,
  firstIndex,
  itemCount,
}: PaginationToggleTemplateProps & { isUpdating: boolean }) => {
  const { t } = useTranslation();

  if (isUpdating) {
    return <Spinner size="sm" />;
  }

  const totalPages = String(Math.ceil((itemCount || 0) / PAGE_SIZE));
  const currentPage = String(Math.ceil((firstIndex || 0) / PAGE_SIZE));
  return (
    <Trans t={t}>
      {currentPage} of <strong>{totalPages}</strong>
    </Trans>
  );
};

const TablePagination = ({ isUpdating, itemCount, currentPage, setCurrentPage }: TablePaginationProps) => {
  const { t } = useTranslation();

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <Pagination
      widgetId="table-pagination"
      isCompact
      variant={PaginationVariant.top}
      toggleTemplate={(props) => <PaginationTemplate isUpdating={isUpdating} {...props} />}
      itemCount={itemCount || 0}
      perPage={PAGE_SIZE}
      page={currentPage}
      perPageOptions={[{ title: t(`{{ numberOfItems }} items`, { numberOfItems: PAGE_SIZE }), value: PAGE_SIZE }]}
      onSetPage={onSetPage}
    />
  );
};

export default TablePagination;
