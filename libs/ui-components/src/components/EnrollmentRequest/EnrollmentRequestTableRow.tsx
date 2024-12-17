import * as React from 'react';
import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';
import { Button } from '@patternfly/react-core';

import { EnrollmentRequest } from '@flightctl/types';
import { timeSinceText } from '../../utils/dates';
import { ListAction } from '../ListPage/types';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE } from '../../hooks/useNavigate';
import ResourceLink from '../common/ResourceLink';

type EnrollmentRequestTableRow = {
  rowIndex: number;
  onRowSelect: (er: EnrollmentRequest) => OnSelect;
  isRowSelected: (er: EnrollmentRequest) => boolean;
  er: EnrollmentRequest;
  onApprove: (id: string) => void;
  deleteAction: ListAction;
};

const EnrollmentRequestTableRow = ({
  er,
  deleteAction,
  rowIndex,
  onRowSelect,
  isRowSelected,
  onApprove,
}: EnrollmentRequestTableRow) => {
  const { t } = useTranslation();
  const erName = er.metadata.name as string;

  const approveEnrollment = () => {
    onApprove(erName);
  };

  return (
    <Tr data-testid={`enrollment-request-${rowIndex}`}>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(er),
          isSelected: isRowSelected(er),
        }}
      />
      <Td dataLabel={t('Name')}>
        <ResourceLink id={erName} routeLink={ROUTE.ENROLLMENT_REQUEST_DETAILS} />
      </Td>
      <Td dataLabel={t('Created')}>{timeSinceText(t, er.metadata.creationTimestamp)}</Td>
      <Td dataLabel={t('Approve')}>
        <Button variant="link" onClick={approveEnrollment}>
          {t('Approve')}
        </Button>
      </Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            {
              title: t('Approve'),
              onClick: approveEnrollment,
            },
            deleteAction({ resourceId: erName }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default EnrollmentRequestTableRow;
