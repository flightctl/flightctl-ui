import * as React from 'react';
import { ActionsColumn, Tbody, Td, Tr } from '@patternfly/react-table';
import {
  Alert,
  Button,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Modal,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { TFunction } from 'i18next';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { CodeBranchIcon } from '@patternfly/react-icons/dist/js/icons/code-branch-icon';
import { Formik, useFormikContext } from 'formik';

import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { useFetch } from '../../hooks/useFetch';
import { ResourceSync, ResourceSyncList } from '@flightctl/types';
import { getObservedHash } from '../../utils/status/repository';
import { useDeleteListAction } from '../ListPage/ListPageActions';
import { useTableSort } from '../../hooks/useTableSort';
import { sortByName } from '../../utils/sort/generic';
import {
  sortResourceSyncsByHash,
  sortResourceSyncsByPath,
  sortResourceSyncsByRevision,
  sortResourceSyncsByStatus,
} from '../../utils/sort/resourceSync';
import Table, { TableColumn } from '../Table/Table';
import { useTableTextSearch } from '../../hooks/useTableTextSearch';
import TableTextSearch from '../Table/TableTextSearch';
import { useTableSelect } from '../../hooks/useTableSelect';
import TableActions from '../Table/TableActions';

import MassDeleteResourceSyncModal from '../modals/massModals/MassDeleteResourceSyncModal/MassDeleteResourceSyncModal';
import ResourceSyncStatus from './ResourceSyncStatus';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppContext } from '../../hooks/useAppContext';
import { getErrorMessage } from '../../utils/error';

import {
  SingleResourceSyncValues,
  getResourceSync,
  singleResourceSyncSchema,
} from '../Repository/CreateRepository/utils';
import { CreateResourceSyncForm } from '../Repository/CreateRepository/CreateResourceSyncsForm';
import FlightCtlActionGroup from '../form/FlightCtlActionGroup';
import FlightCtlForm from '../form/FlightCtlForm';
import ResourceListEmptyState from '../common/ResourceListEmptyState';
import ListPageBody from '../ListPage/ListPageBody';

import './RepositoryResourceSyncList.css';

const getColumns = (t: TFunction): TableColumn<ResourceSync>[] => [
  {
    name: t('Name'),
    onSort: sortByName,
  },
  {
    name: t('Path'),
    onSort: sortResourceSyncsByPath,
  },
  {
    name: t('Target revision'),
    onSort: sortResourceSyncsByRevision,
  },
  {
    name: t('Status'),
    onSort: sortResourceSyncsByStatus,
  },
  {
    name: t('Observed hash'),
    onSort: sortResourceSyncsByHash,
  },
];

const createRefs = (rsList: ResourceSync[]): { [key: string]: React.RefObject<HTMLTableRowElement> } => {
  const rsRefs = {};
  rsList.forEach((rs) => {
    if (rs.metadata.name) {
      rsRefs[rs.metadata.name] = React.createRef();
    }
  });
  return rsRefs;
};

const getSearchText = (resourceSync: ResourceSync) => [resourceSync.metadata.name];

const ResourceSyncEmptyState = ({ addResourceSync }: { addResourceSync: VoidFunction }) => {
  const { t } = useTranslation();
  return (
    <ResourceListEmptyState icon={CodeBranchIcon} titleText={t('No resource syncs here!')}>
      <EmptyStateBody>
        {t(
          "A resource sync is an automated Gitops way to manage imported fleets. The resource syncs monitors changes made to the source repository and updates the fleets' configurations accordingly.",
        )}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="secondary" onClick={addResourceSync}>
            {t('Add a resource sync')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </ResourceListEmptyState>
  );
};

const CreateResourceSyncModalForm = ({ onClose }: { onClose: VoidFunction }) => {
  const { t } = useTranslation();
  const { values, submitForm, errors, dirty, isSubmitting } = useFormikContext<SingleResourceSyncValues>();
  const rsToAdd = values.resourceSyncs[0];
  const isSubmitDisabled = !dirty || Object.keys(errors).length > 0;

  return (
    <FlightCtlForm>
      <CreateResourceSyncForm rs={rsToAdd} index={0} />
      <FlightCtlActionGroup>
        <Button variant="primary" onClick={submitForm} isLoading={isSubmitting} isDisabled={isSubmitDisabled}>
          {t('Add a resource sync')}
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={onClose}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
    </FlightCtlForm>
  );
};

const CreateResourceSyncModal = ({
  repositoryId,
  storedRSs,
  onClose,
}: {
  repositoryId: string;
  storedRSs: ResourceSync[];
  onClose: (isAdded?: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const [submitError, setSubmitError] = React.useState<string | undefined>();

  return (
    <Modal variant="medium" title={t('Add a resource sync')} onClose={() => onClose()} isOpen>
      <Formik<SingleResourceSyncValues>
        initialValues={{ resourceSyncs: [{ name: '', targetRevision: '', path: '' }] }}
        validationSchema={singleResourceSyncSchema(t, storedRSs)}
        onSubmit={async (values: SingleResourceSyncValues) => {
          const rsToAdd = getResourceSync(repositoryId, values.resourceSyncs[0]);
          try {
            await post<ResourceSync>('resourcesyncs', rsToAdd);
            setSubmitError(undefined);
            onClose(true);
          } catch (e) {
            setSubmitError(getErrorMessage(e));
          }
        }}
      >
        <>
          <CreateResourceSyncModalForm onClose={onClose} />
          {submitError && (
            <Alert variant="danger" title={t('Unexpected error occurred')} isInline>
              {submitError}
            </Alert>
          )}
        </>
      </Formik>
    </Modal>
  );
};

const RepositoryResourceSyncList = ({ repositoryId }: { repositoryId: string }) => {
  const [rsList, isLoading, error, refetch] = useFetchPeriodically<ResourceSyncList>({
    endpoint: `resourcesyncs?repository=${repositoryId}`,
  });

  const resourceSyncs = rsList?.items || [];

  const { t } = useTranslation();
  const { remove } = useFetch();
  const {
    router: { useLocation },
  } = useAppContext();
  const { hash = '#' } = useLocation();
  const rsRefs = createRefs(resourceSyncs);
  const selectedRs = hash.split('#')[1];

  React.useEffect(() => {
    const rsRow = rsRefs[selectedRs]?.current;
    if (rsRow) {
      rsRow.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    // Needs to be run only at the beginning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { filteredData, search, setSearch } = useTableTextSearch(resourceSyncs, getSearchText);

  const columns = React.useMemo(() => getColumns(t), [t]);
  const { getSortParams, sortedData } = useTableSort(filteredData, columns);

  const { onRowSelect, hasSelectedRows, isAllSelected, isRowSelected, setAllSelected } = useTableSelect();

  const { deleteAction, deleteModal } = useDeleteListAction({
    resourceType: 'Resource Sync',
    onDelete: async (resourceId: string) => {
      await remove(`resourcesyncs/${resourceId}`);
      refetch();
    },
  });
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const [isAddRsModalOpen, setIsAddRsModalOpen] = React.useState(false);

  return (
    <ListPageBody error={error} loading={isLoading}>
      <Toolbar id="resource-sync-toolbar" inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem variant="search-filter">
              <TableTextSearch value={search} setValue={setSearch} />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem>
            <TableActions>
              <SelectList>
                <SelectOption isDisabled={!hasSelectedRows} onClick={() => setIsMassDeleteModalOpen(true)}>
                  {t('Delete')}
                </SelectOption>
              </SelectList>
            </TableActions>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      {resourceSyncs.length > 0 && (
        <Button
          variant="link"
          icon={<PlusCircleIcon />}
          className="fctl-rslist__addrsbutton"
          onClick={() => {
            setIsAddRsModalOpen(true);
          }}
        >
          {t('Add a resource sync')}
        </Button>
      )}
      <Table
        aria-label={t('Resource syncs table')}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
        columns={columns}
        emptyFilters={filteredData.length === 0}
        emptyData={resourceSyncs.length === 0}
        getSortParams={getSortParams}
      >
        <Tbody>
          {sortedData.map((resourceSync, rowIndex) => {
            const rsName = resourceSync.metadata.name as string;
            const rsRef = rsRefs[rsName];
            const isSelected = rsName === selectedRs;
            return (
              <Tr key={rsName} ref={rsRef} className={isSelected ? 'fctl-rslist-row--selected' : ''}>
                <Td
                  select={{
                    rowIndex,
                    onSelect: onRowSelect(resourceSync),
                    isSelected: isRowSelected(resourceSync),
                  }}
                />
                <Td dataLabel={t('Name')}>{rsName}</Td>
                <Td dataLabel={t('Path')}>{resourceSync.spec.path || ''}</Td>
                <Td dataLabel={t('Target revision')}>{resourceSync.spec.targetRevision}</Td>
                <Td dataLabel={t('Status')}>
                  <ResourceSyncStatus resourceSync={resourceSync} />
                </Td>
                <Td dataLabel={t('Observed hash')}>{getObservedHash(resourceSync)}</Td>
                <Td isActionCell>
                  <ActionsColumn items={[deleteAction({ resourceId: resourceSync.metadata.name || '' })]} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {resourceSyncs.length === 0 && (
        <ResourceSyncEmptyState
          addResourceSync={() => {
            setIsAddRsModalOpen(true);
          }}
        />
      )}
      {deleteModal}
      {isMassDeleteModalOpen && (
        <MassDeleteResourceSyncModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          resources={sortedData.filter(isRowSelected)}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
          }}
        />
      )}
      {isAddRsModalOpen && (
        <CreateResourceSyncModal
          repositoryId={repositoryId}
          storedRSs={resourceSyncs}
          onClose={(isAdded?: boolean) => {
            setIsAddRsModalOpen(false);
            if (isAdded) {
              refetch();
            }
          }}
        />
      )}
    </ListPageBody>
  );
};

export default RepositoryResourceSyncList;
