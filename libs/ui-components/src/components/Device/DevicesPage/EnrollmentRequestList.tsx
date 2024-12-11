import * as React from 'react';
import { TFunction } from 'react-i18next';
import { Tbody } from '@patternfly/react-table';
import { SelectList, SelectOption, Spinner, ToolbarItem } from '@patternfly/react-core';

import { EnrollmentRequest, EnrollmentRequestList as EnrollmentRequestListType } from '@flightctl/types';

import Table, { ApiSortTableColumn } from '../../Table/Table';
import TableActions from '../../Table/TableActions';
import ListPage from '../../ListPage/ListPage';
import ListPageBody from '../../ListPage/ListPageBody';
import { useDeleteListAction } from '../../ListPage/ListPageActions';
import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useTableSelect } from '../../../hooks/useTableSelect';
import { useTableTextSearch } from '../../../hooks/useTableTextSearch';

import ApproveDeviceModal from '../../modals/ApproveDeviceModal/ApproveDeviceModal';
import MassDeleteDeviceModal from '../../modals/massModals/MassDeleteDeviceModal/MassDeleteDeviceModal';
import MassApproveDeviceModal from '../../modals/massModals/MassApproveDeviceModal/MassApproveDeviceModal';
import EnrollmentRequestTableRow from '../../EnrollmentRequest/EnrollmentRequestTableRow';
import EnrollmentRequestTableToolbar from './EnrollmentRequestTableToolbar';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useAccessReview } from '../../../hooks/useAccessReview';
import ResourceListEmptyState from '../../common/ResourceListEmptyState';
import { MicrochipIcon } from '@patternfly/react-icons/dist/js/icons';

const ErEmptyState = () => {
  const { t } = useTranslation();
  return <ResourceListEmptyState icon={MicrochipIcon} titleText={t('No enrollment requests here!')} />;
};

const getEnrollmentColumns = (t: TFunction): ApiSortTableColumn[] => [
  {
    name: t('Name'),
  },
  {
    name: t('Created'),
  },
];

const getSearchText = (er: EnrollmentRequest) => [er.metadata.name];

type EnrollmentRequestListProps = { refetchDevices?: VoidFunction; isStandalone?: boolean };

const EnrollmentRequestList = ({ refetchDevices, isStandalone }: EnrollmentRequestListProps) => {
  const { t } = useTranslation();
  const [canApprove] = useAccessReview(RESOURCE.ENROLLMENT_REQUEST_APPROVAL, VERB.POST);
  const [canDelete] = useAccessReview(RESOURCE.ENROLLMENT_REQUEST, VERB.DELETE);
  const { remove } = useFetch();
  const enrollmentColumns = React.useMemo(() => getEnrollmentColumns(t), [t]);

  const [erList, isLoading, error, refetch] = useFetchPeriodically<EnrollmentRequestListType>({
    endpoint: 'enrollmentrequests?fieldSelector=!status.approval.approved',
  });
  const pendingEnrollments = erList?.items || [];

  const refetchWithDevices = () => {
    refetch();
    refetchDevices?.();
  };

  const [approvingErId, setApprovingErId] = React.useState<string>();
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const [isMassApproveModalOpen, setIsMassApproveModalOpen] = React.useState(false);

  const { search, setSearch, filteredData } = useTableTextSearch(pendingEnrollments, getSearchText);

  const { onRowSelect, hasSelectedRows, isAllSelected, isRowSelected, setAllSelected } = useTableSelect();

  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'EnrollmentRequest',
    onDelete: async (enrollmentId: string) => {
      await remove(`enrollmentrequests/${enrollmentId}`);
      refetch();
    },
  });

  if (isLoading) {
    return <Spinner size="md" />;
  }

  if (pendingEnrollments.length === 0) {
    return isStandalone ? <ErEmptyState /> : null;
  }

  const currentEnrollmentRequest = pendingEnrollments.find((er) => er.metadata.name === approvingErId);

  return (
    <ListPage title={t('Devices pending approval')} headingLevel="h2">
      <ListPageBody error={error} loading={isLoading}>
        <EnrollmentRequestTableToolbar search={search} setSearch={setSearch} enrollments={pendingEnrollments}>
          {(canApprove || canDelete) && (
            <ToolbarItem>
              <TableActions isDisabled={!hasSelectedRows}>
                <SelectList>
                  {canApprove && (
                    <SelectOption onClick={() => setIsMassApproveModalOpen(true)}>{t('Approve')}</SelectOption>
                  )}
                  {canDelete && (
                    <SelectOption onClick={() => setIsMassDeleteModalOpen(true)}>{t('Delete')}</SelectOption>
                  )}
                </SelectList>
              </TableActions>
            </ToolbarItem>
          )}
        </EnrollmentRequestTableToolbar>
        <Table
          aria-label={t('Table for devices pending approval')}
          loading={isLoading}
          columns={enrollmentColumns}
          emptyFilters={filteredData.length === 0}
          emptyData={false}
          isAllSelected={isAllSelected}
          onSelectAll={setAllSelected}
        >
          <Tbody>
            {pendingEnrollments.map((er, index) => (
              <EnrollmentRequestTableRow
                key={er.metadata.name || ''}
                er={er}
                deleteAction={deleteAction}
                onRowSelect={onRowSelect}
                isRowSelected={isRowSelected}
                rowIndex={index}
                onApprove={() => {
                  setApprovingErId(er.metadata.name as string);
                }}
                canApprove={canApprove}
                canDelete={canDelete}
              />
            ))}
          </Tbody>
        </Table>

        {deleteModal}
        {currentEnrollmentRequest && (
          <ApproveDeviceModal
            enrollmentRequest={currentEnrollmentRequest}
            onClose={(updateList) => {
              setApprovingErId(undefined);
              updateList && refetchWithDevices();
            }}
          />
        )}
        {isMassDeleteModalOpen && (
          <MassDeleteDeviceModal
            onClose={() => setIsMassDeleteModalOpen(false)}
            resources={filteredData.filter(isRowSelected)}
            onDeleteSuccess={() => {
              setIsMassDeleteModalOpen(false);
              refetch();
            }}
          />
        )}
        {isMassApproveModalOpen && (
          <MassApproveDeviceModal
            onClose={() => setIsMassApproveModalOpen(false)}
            pendingEnrollments={filteredData.filter(isRowSelected)}
            onApproveSuccess={() => {
              setAllSelected(false);
              setIsMassApproveModalOpen(false);
              refetchWithDevices();
            }}
          />
        )}
      </ListPageBody>
    </ListPage>
  );
};

export default EnrollmentRequestList;
