import * as React from 'react';
import { TFunction } from 'react-i18next';
import { Tbody } from '@patternfly/react-table';
import { SelectList, SelectOption, ToolbarItem } from '@patternfly/react-core';

import { EnrollmentRequest, EnrollmentRequestList as EnrollmentRequestListType } from '@flightctl/types';

import Table, { TableColumn } from '../../Table/Table';
import TableActions from '../../Table/TableActions';
import ListPage from '../../ListPage/ListPage';
import ListPageBody from '../../ListPage/ListPageBody';
import { useDeleteListAction } from '../../ListPage/ListPageActions';
import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useTableSelect } from '../../../hooks/useTableSelect';
import { useTableSort } from '../../../hooks/useTableSort';
import { useTableTextSearch } from '../../../hooks/useTableTextSearch';
import { sortByCreationDate, sortByName } from '../../../utils/sort/generic';

import ApproveDeviceModal from '../../modals/ApproveDeviceModal/ApproveDeviceModal';
import MassDeleteDeviceModal from '../../modals/massModals/MassDeleteDeviceModal/MassDeleteDeviceModal';
import MassApproveDeviceModal from '../../modals/massModals/MassApproveDeviceModal/MassApproveDeviceModal';
import EnrollmentRequestTableRow from '../../EnrollmentRequest/EnrollmentRequestTableRow';
import EnrollmentRequestTableToolbar from './EnrollmentRequestTableToolbar';

const getEnrollmentColumns = (t: TFunction): TableColumn<EnrollmentRequest>[] => [
  {
    name: t('Name'),
    onSort: sortByName,
  },
  {
    name: t('Created'),
    onSort: sortByCreationDate,
  },
];

interface EnrollmentRequestTableProps {
  pendingEnrollments: Array<EnrollmentRequest>;
  approveRefetch: VoidFunction;
  deleteRefetch: VoidFunction;
}

const getSearchText = (er: EnrollmentRequest) => [er.metadata.name];

export const EnrollmentRequestTable = ({
  pendingEnrollments,
  approveRefetch,
  deleteRefetch,
}: EnrollmentRequestTableProps) => {
  const { t } = useTranslation();
  const { remove } = useFetch();

  const [approvingErId, setApprovingErId] = React.useState<string>();
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const [isMassApproveModalOpen, setIsMassApproveModalOpen] = React.useState(false);

  const enrollmentColumns = React.useMemo(() => getEnrollmentColumns(t), [t]);

  const { search, setSearch, filteredData } = useTableTextSearch(pendingEnrollments, getSearchText);
  const { getSortParams, sortedData } = useTableSort(filteredData, enrollmentColumns);

  const { onRowSelect, hasSelectedRows, isAllSelected, isRowSelected, setAllSelected } = useTableSelect();

  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'EnrollmentRequest',
    onDelete: async (enrollmentId: string) => {
      await remove(`enrollmentrequests/${enrollmentId}`);
      deleteRefetch();
    },
  });

  const currentEnrollmentRequest = pendingEnrollments.find((er) => er.metadata.name === approvingErId);

  return (
    <>
      <EnrollmentRequestTableToolbar search={search} setSearch={setSearch} enrollments={pendingEnrollments}>
        <ToolbarItem>
          <TableActions>
            <SelectList>
              <SelectOption isDisabled={!hasSelectedRows} onClick={() => setIsMassApproveModalOpen(true)}>
                {t('Approve')}
              </SelectOption>
              <SelectOption isDisabled={!hasSelectedRows} onClick={() => setIsMassDeleteModalOpen(true)}>
                {t('Delete')}
              </SelectOption>
            </SelectList>
          </TableActions>
        </ToolbarItem>
      </EnrollmentRequestTableToolbar>
      <Table
        aria-label={t('Table for devices pending approval')}
        columns={enrollmentColumns}
        emptyFilters={filteredData.length === 0}
        emptyData={false}
        getSortParams={getSortParams}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {sortedData.map((er, index) => (
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
            updateList && approveRefetch();
          }}
        />
      )}
      {isMassDeleteModalOpen && (
        <MassDeleteDeviceModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          resources={filteredData.filter(isRowSelected)}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            deleteRefetch();
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
            approveRefetch();
          }}
        />
      )}
    </>
  );
};

const EnrollmentRequestList = ({ refetchDevices }: { refetchDevices: VoidFunction }) => {
  const { t } = useTranslation();
  const [erList, isLoading, error, refetch] = useFetchPeriodically<EnrollmentRequestListType>({
    endpoint: 'enrollmentrequests',
  });

  // TODO move the filter as part of the query once it's available via the API
  const pendingEnrollments = (erList?.items || []).filter((er) => er.status?.approval?.approved !== true);

  const approveRefetch = () => {
    refetch();
    refetchDevices();
  };

  if (!isLoading && pendingEnrollments.length === 0) {
    return null;
  }

  return (
    <ListPage title={t('Devices pending approval')}>
      <ListPageBody error={error} loading={isLoading}>
        <EnrollmentRequestTable
          pendingEnrollments={pendingEnrollments}
          approveRefetch={approveRefetch}
          deleteRefetch={refetch}
        />
      </ListPageBody>
    </ListPage>
  );
};

export default EnrollmentRequestList;
