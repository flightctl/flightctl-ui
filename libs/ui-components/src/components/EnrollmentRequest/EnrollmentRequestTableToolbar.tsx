import * as React from 'react';
import { Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';

import { EnrollmentRequest } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';

import TableTextSearch, { TableTextSearchProps } from '../Table/TableTextSearch';

type EnrollmentRequestTableToolbarProps = {
  enrollments: EnrollmentRequest[];
  search: TableTextSearchProps['value'];
  setSearch: TableTextSearchProps['setValue'];
};

const EnrollmentRequestTableToolbar = ({
  search,
  setSearch,
  children,
}: React.PropsWithChildren<EnrollmentRequestTableToolbarProps>) => {
  const { t } = useTranslation();

  return (
    <Toolbar id="enrollment-requests-toolbar" inset={{ default: 'insetNone' }}>
      <ToolbarContent>
        <ToolbarGroup>
          <ToolbarItem>
            <TableTextSearch value={search} setValue={setSearch} placeholder={t('Search by name')} />
          </ToolbarItem>
        </ToolbarGroup>
        {children}
      </ToolbarContent>
    </Toolbar>
  );
};

export default EnrollmentRequestTableToolbar;
