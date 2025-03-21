import * as React from 'react';
import { ActionsColumn, IAction, OnSelect, Td, Tr } from '@patternfly/react-table';
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
  canApprove: boolean;
  canDelete: boolean;
};

const EnrollmentRequestTableRow: React.FC<EnrollmentRequestTableRow> = ({
  er,
  deleteAction,
  rowIndex,
  onRowSelect,
  isRowSelected,
  onApprove,
  canApprove,
  canDelete,
}) => {
  const { t } = useTranslation();
  const erName = er.metadata.name as string;
  const erAlias = er.spec.labels?.alias;

  const approveEnrollment = () => {
    onApprove(erName);
  };

  const actionItems: IAction[] = [];
  if (canApprove) {
    actionItems.push({
      title: t('Approve'),
      onClick: approveEnrollment,
    });
  }
  if (canDelete) {
    actionItems.push(deleteAction({ resourceId: erName }));
  }

  return (
    <Tr data-testid={`enrollment-request-${rowIndex}`}>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(er),
          isSelected: isRowSelected(er),
        }}
      />
      <Td dataLabel={t('Alias')}>
        <ResourceLink id={erName} name={erAlias || t('Untitled')} routeLink={ROUTE.ENROLLMENT_REQUEST_DETAILS} />
      </Td>
      <Td dataLabel={t('Name')}>
        <ResourceLink id={erName} />
      </Td>
      <Td dataLabel={t('Created')}>{timeSinceText(t, er.metadata.creationTimestamp)}</Td>
      {canApprove && (
        <Td dataLabel={t('Approve')}>
          <Button variant="link" onClick={approveEnrollment}>
            {t('Approve')}
          </Button>
        </Td>
      )}
      {!!actionItems.length && (
        <Td isActionCell>
          <ActionsColumn items={actionItems} />
        </Td>
      )}
    </Tr>
  );
};

export default EnrollmentRequestTableRow;
