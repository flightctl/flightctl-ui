import * as React from 'react';
import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';

import { EnrollmentRequest } from '@flightctl/types';
import { timeSinceText } from '../../utils/dates';
import { DeleteListActionResult } from '../ListPage/types';
import {
  EnrollmentRequestStatus as EnrollmentRequestStatusType,
  getApprovalStatus,
} from '../../utils/status/enrollmentRequest';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE } from '../../hooks/useNavigate';
import ResourceLink from '../common/ResourceLink';
import EnrollmentRequestStatus from '../Status/EnrollmentRequestStatus';

type EnrollmentRequestTableRow = {
  rowIndex: number;
  onRowSelect: (er: EnrollmentRequest) => OnSelect;
  isRowSelected: (er: EnrollmentRequest) => boolean;
  er: EnrollmentRequest;
  onApprove: (id: string) => void;
  deleteAction: DeleteListActionResult['deleteAction'];
};

const EnrollmentRequestTableRow: React.FC<EnrollmentRequestTableRow> = ({
  er,
  deleteAction,
  rowIndex,
  onRowSelect,
  isRowSelected,
  onApprove,
}) => {
  const { t } = useTranslation();
  const approvalStatus = getApprovalStatus(er);
  const erName = er.metadata.name as string;
  return (
    <Tr data-testid={`enrollment-request-${rowIndex}`}>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(er),
          isSelected: isRowSelected(er),
        }}
      />
      <Td dataLabel={t('Alias')}>-</Td>
      <Td dataLabel={t('Name')}>
        <ResourceLink id={erName} routeLink={ROUTE.ENROLLMENT_REQUEST_DETAILS} />
      </Td>
      <Td dataLabel={t('Fleet')}>-</Td>
      <Td dataLabel={t('Application status')}>-</Td>
      <Td dataLabel={t('Device status')}>
        <EnrollmentRequestStatus er={er} />
      </Td>
      <Td dataLabel={t('System update status')}>-</Td>
      <Td dataLabel={t('Last seen')}>{timeSinceText(t, er.metadata.creationTimestamp)}</Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            {
              title: t('Approve'),
              onClick: () => er.metadata.name && onApprove(er.metadata.name),
              isDisabled: approvalStatus !== EnrollmentRequestStatusType.Pending,
            },
            deleteAction({ resourceId: er.metadata.name || '' }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default EnrollmentRequestTableRow;
