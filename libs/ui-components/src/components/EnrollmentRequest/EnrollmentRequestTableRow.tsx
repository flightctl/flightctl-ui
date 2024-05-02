import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';
import { EnrollmentRequest } from '@flightctl/types';
import * as React from 'react';
import { getDateDisplay } from '../../utils/dates';
import { getFingerprintDisplay } from '../../utils/devices';
import EnrollmentRequestStatus from './EnrollmentRequestStatus';
import { DeleteListActionResult } from '../ListPage/types';
import { ApprovalStatus, getApprovalStatus } from '../../utils/status/enrollmentRequest';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, ROUTE } from '../../hooks/useNavigate';

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
  return (
    <Tr data-testid={`enrollment-request-${rowIndex}`}>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(er),
          isSelected: isRowSelected(er),
        }}
      />
      <Td dataLabel={t('Fingerprint')}>
        <Link to={{ route: ROUTE.ENROLLMENT_REQUEST_DETAILS, postfix: er.metadata.name }}>
          {getFingerprintDisplay(er)}
        </Link>
      </Td>
      <Td dataLabel={t('Name')}>-</Td>
      <Td dataLabel={t('Fleet')}>-</Td>
      <Td dataLabel={t('Status')}>
        <EnrollmentRequestStatus er={er} />
      </Td>
      <Td dataLabel={t('Created at')}>{getDateDisplay(er.metadata.creationTimestamp)}</Td>
      <Td dataLabel={t('Operating system')}>{er.spec.deviceStatus?.systemInfo?.operatingSystem || '-'}</Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            {
              title: t('Approve'),
              onClick: () => er.metadata.name && onApprove(er.metadata.name),
              isDisabled: approvalStatus !== ApprovalStatus.Pending,
            },
            deleteAction({ resourceId: er.metadata.name || '' }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default EnrollmentRequestTableRow;
