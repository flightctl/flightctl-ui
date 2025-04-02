import * as React from 'react';
import { TFunction } from 'react-i18next';
import { Tbody } from '@patternfly/react-table';
import { SelectList, SelectOption, ToolbarItem } from '@patternfly/react-core';
import { MicrochipIcon } from '@patternfly/react-icons/dist/js/icons';

import { EnrollmentRequestList } from '@flightctl/types';

import Table, { ApiSortTableColumn } from '../Table/Table';
import TableActions from '../Table/TableActions';
import ListPage from '../ListPage/ListPage';
import ListPageBody from '../ListPage/ListPageBody';
import { useDeleteListAction } from '../ListPage/ListPageActions';
import { useFetch } from '../../hooks/useFetch';
import { useTranslation } from '../../hooks/useTranslation';
import { useTableSelect } from '../../hooks/useTableSelect';
import ApproveDeviceModal from '../modals/ApproveDeviceModal/ApproveDeviceModal';
import MassDeleteDeviceModal from '../modals/massModals/MassDeleteDeviceModal/MassDeleteDeviceModal';
import MassApproveDeviceModal from '../modals/massModals/MassApproveDeviceModal/MassApproveDeviceModal';
import EnrollmentRequestTableRow from '../EnrollmentRequest/EnrollmentRequestTableRow';
import EnrollmentRequestTableToolbar from './EnrollmentRequestTableToolbar';
import { RESOURCE, VERB } from '../../types/rbac';
import { useAccessReview } from '../../hooks/useAccessReview';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import { usePendingEnrollments } from './useEnrollmentRequests';
import TablePagination from '../Table/TablePagination';

const EnrollmentRequestEmptyState = () => {
  const { t } = useTranslation();
  return <ResourceListEmptyState icon={MicrochipIcon} titleText={t('No enrollment requests here!')} />;
};

const getEnrollmentColumns = (t: TFunction): ApiSortTableColumn[] => [
  {
    name: t('Alias'),
  },
  {
    name: t('Name'),
  },
  {
    name: t('Created'),
  },
];

type EnrollmentRequestListProps = { refetchDevices?: VoidFunction; isStandalone?: boolean };

const EnrollmentRequestList = ({ refetchDevices, isStandalone }: EnrollmentRequestListProps) => {
  const { t } = useTranslation();
  const [canApprove] = useAccessReview(RESOURCE.ENROLLMENT_REQUEST_APPROVAL, VERB.POST);
  const [canDelete] = useAccessReview(RESOURCE.ENROLLMENT_REQUEST, VERB.DELETE);
  const { remove } = useFetch();
  const [search, setSearch] = React.useState<string>('');
  const [isLastUnfilteredListEmpty, setIsLastUnfilteredListEmpty] = React.useState<boolean>(false);

  const enrollmentColumns = React.useMemo(() => getEnrollmentColumns(t), [t]);

  const [pendingEnrollments, isLoading, error, refetch, pagination] = usePendingEnrollments(search);
  const itemCount = pendingEnrollments.length;

  const refetchWithDevices = () => {
    refetch();
    refetchDevices?.();
  };

  const [approvingErId, setApprovingErId] = React.useState<string>();
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const [isMassApproveModalOpen, setIsMassApproveModalOpen] = React.useState(false);

  const { onRowSelect, hasSelectedRows, isAllSelected, isRowSelected, setAllSelected } = useTableSelect();

  const { action: deleteAction, modal: deleteModal } = useDeleteListAction({
    resourceType: 'EnrollmentRequest',
    onConfirm: async (enrollmentId: string) => {
      await remove(`enrollmentrequests/${enrollmentId}`);
      refetch();
    },
  });

  React.useEffect(() => {
    if (!search && !isLoading) {
      setIsLastUnfilteredListEmpty(itemCount === 0);
    }
  }, [itemCount, search, isLoading]);

  // In non-standalone mode, hide the entire component when the search result is empty (and not due to filtering)
  if (!isStandalone && isLastUnfilteredListEmpty) {
    return null;
  }

  const currentEnrollmentRequest = pendingEnrollments.find((er) => er.metadata.name === approvingErId);

  return (
    <ListPage title={t('Devices pending approval')} headingLevel="h2">
      <ListPageBody error={error} loading={false}>
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
          loading={!!isStandalone && isLoading && isLastUnfilteredListEmpty}
          columns={enrollmentColumns}
          emptyFilters={!search}
          emptyData={isLastUnfilteredListEmpty}
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
        <TablePagination pagination={pagination} isUpdating={isLoading} />
        {isStandalone && pendingEnrollments.length === 0 && !isLoading && <EnrollmentRequestEmptyState />}
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
            resources={pendingEnrollments.filter(isRowSelected)}
            onDeleteSuccess={() => {
              setIsMassDeleteModalOpen(false);
              refetch();
            }}
          />
        )}
        {isMassApproveModalOpen && (
          <MassApproveDeviceModal
            onClose={() => setIsMassApproveModalOpen(false)}
            pendingEnrollments={pendingEnrollments.filter(isRowSelected)}
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
