import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';
import { EnrollmentRequest } from '@flightctl/types';
import * as React from 'react';
import { getDateDisplay } from '../../utils/dates';
import { DeleteListActionResult } from '../ListPage/types';
import { getApprovalStatus } from '../../utils/status/enrollmentRequest';
import { EnrollmentRequestStatus as EnrollmentRequestStatusType } from '../../utils/status/common';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE } from '../../hooks/useNavigate';
import DisplayName from '../common/DisplayName';
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
      <Td dataLabel={t('Name')}>-</Td>
      <Td dataLabel={t('Fingerprint')}>
        <DisplayName name={erName} routeLink={ROUTE.ENROLLMENT_REQUEST_DETAILS} />
      </Td>
      <Td dataLabel={t('Fleet')}>-</Td>
      <Td dataLabel={t('Status')}>
        <EnrollmentRequestStatus er={er} />
      </Td>
      <Td dataLabel={t('Created at')}>{getDateDisplay(er.metadata.creationTimestamp)}</Td>
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
