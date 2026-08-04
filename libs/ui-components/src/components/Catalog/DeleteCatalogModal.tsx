import * as React from 'react';
import { Trans } from 'react-i18next';
import {
  Alert,
  Button,
  Content,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import FlightCtlModal from '@flightctl/ui-components/src/components/common/FlightCtlModal';

import type { CatalogItemDeploymentList, CatalogItemList } from '@flightctl/types/alpha';

import { getErrorMessage } from '../../utils/error';
import { useFetch } from '../../hooks/useFetch';
import { useTranslation } from '../../hooks/useTranslation';
import { isPromiseRejected } from '../../types/typeUtils';

type DeleteCatalogModalProps = {
  onClose: VoidFunction;
  onDeleteSuccess: VoidFunction;
  catalogId: string;
  catalogDisplayName: string;
};

type CatalogItemInfo = {
  id: string;
  displayName: string;
  // Populated after attempting to delete a catalog item that's used in at least one deployment
  isInUse?: boolean;
};

const FailedItemsTable = ({ items }: { items: CatalogItemInfo[] }) => {
  const { t } = useTranslation();
  return (
    <Table>
      <Thead>
        <Tr>
          <Th modifier="fitContent">{t('Name')}</Th>
          <Th>{t('Reason')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((item) => (
          <Tr key={item.id}>
            <Td dataLabel={t('Name')}>{item.displayName}</Td>
            <Td dataLabel={t('Reason')}>
              {item.isInUse
                ? t('Catalog item is used in at least one fleet or device.')
                : t('Reason is unknown. Retrying deletion may succeed.')}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const DeleteCatalogModal = ({ catalogId, catalogDisplayName, onClose, onDeleteSuccess }: DeleteCatalogModalProps) => {
  const { t } = useTranslation();
  const { get, remove } = useFetch();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [loadItemsError, setLoadItemsError] = React.useState<unknown>();
  const [message, setMessage] = React.useState<string>();
  const [catalogItems, setCatalogItems] = React.useState<CatalogItemInfo[]>();
  const [hasFailedToDeleteItems, setHasFailedToDeleteItems] = React.useState(false);
  const isLoadingItems = catalogItems === undefined;
  const hasCatalogItems = !!catalogItems?.length;

  const updateFailedDeletionStatus = async (failedToDelete: CatalogItemInfo[]) => {
    const failedItems = await Promise.all(
      failedToDelete.map(async (item): Promise<CatalogItemInfo> => {
        try {
          const deployments = await get<CatalogItemDeploymentList>(
            `catalogs/${catalogId}/items/${item.id}/deployments?limit=1`,
          );
          return { ...item, isInUse: deployments.items.length > 0 };
        } catch {
          return { ...item, isInUse: false };
        }
      }),
    );

    setCatalogItems(failedItems);
  };

  const deleteCatalogItems = async () => {
    const itemsToDelete = catalogItems || [];
    if (itemsToDelete.length === 0) {
      return true;
    }
    setMessage(t('Deleting {{count}} catalog items', { count: itemsToDelete.length }));
    const results = await Promise.allSettled(
      itemsToDelete.map(async (item) => {
        await remove(`catalogs/${catalogId}/items/${item.id}`);
        return item;
      }),
    );

    const failedToDelete = results.flatMap((result, index) =>
      isPromiseRejected(result) ? [itemsToDelete[index]] : [],
    );
    if (failedToDelete.length > 0) {
      setHasFailedToDeleteItems(true);
      await updateFailedDeletionStatus(failedToDelete);
      return false;
    }
    return true;
  };

  const deleteCatalogAndItems = async () => {
    const allItemsDeleted = await deleteCatalogItems();
    if (allItemsDeleted) {
      setCatalogItems([]);
      setHasFailedToDeleteItems(false);
      await remove(`catalogs/${catalogId}`);
    }
    return allItemsDeleted;
  };

  const loadCatalogItems = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('fieldSelector', `metadata.catalog in (${catalogId})`);
      const items = await get<CatalogItemList>(`catalogitems?${params.toString()}`);
      setCatalogItems(
        items.items.map((item) => ({
          id: item.metadata.name || '',
          displayName: item.spec.displayName || item.metadata.name || '',
        })),
      );
      setLoadItemsError(undefined);
    } catch (e) {
      setLoadItemsError(e);
      setCatalogItems([]);
    }
  }, [get, catalogId]);

  React.useEffect(() => {
    void loadCatalogItems();
  }, [loadCatalogItems]);

  const deleteAction = async () => {
    setError(undefined);
    try {
      setIsDeleting(true);
      const success = await deleteCatalogAndItems();
      if (success) {
        onDeleteSuccess();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  let content: React.ReactNode = null;
  if (loadItemsError) {
    content = (
      <Alert isInline variant="warning" title={t('Cannot delete catalog')}>
        {t(
          `The catalog cannot be safely deleted at this moment, as we couldn't determine if the catalog contains items. Detail: {{detail}}`,
          { detail: getErrorMessage(loadItemsError) },
        )}
      </Alert>
    );
  } else if (!hasFailedToDeleteItems) {
    content = (
      <Trans t={t}>
        Are you sure you want to delete the catalog <b>{catalogDisplayName}</b>?
      </Trans>
    );
  }

  return (
    <FlightCtlModal isOpen onClose={onClose} variant={hasCatalogItems || hasFailedToDeleteItems ? 'medium' : 'small'}>
      <ModalHeader
        title={hasFailedToDeleteItems ? t('Catalog deletion failure') : t('Delete catalog ?')}
        titleIconVariant={hasFailedToDeleteItems ? 'danger' : 'warning'}
      />
      <ModalBody>
        <Stack hasGutter>
          {hasCatalogItems && !hasFailedToDeleteItems && (
            <StackItem>
              <Content component="p">
                {t(
                  'This catalog contains catalog items. By deleting the catalog, its catalog items will also be deleted.',
                )}
              </Content>
            </StackItem>
          )}
          {content && <StackItem>{content}</StackItem>}
          {isDeleting && !!message && (
            <StackItem>
              <Spinner size="sm" /> {message}
            </StackItem>
          )}
          {isLoadingItems && (
            <StackItem>
              <Spinner size="sm" /> {t('Checking if the catalog has items')}
            </StackItem>
          )}
          {error && (
            <StackItem>
              <Alert isInline variant="danger" title={t('An error occurred')}>
                {error}
              </Alert>
            </StackItem>
          )}
          {hasFailedToDeleteItems && (
            <>
              <StackItem>
                <Content component="p">
                  {t(
                    'The catalog could not be deleted because it contains catalog items that failed to delete. Review the details below and retry the deletion if necessary.',
                  )}
                </Content>
              </StackItem>
              <StackItem>
                <FailedItemsTable items={catalogItems || []} />
              </StackItem>
            </>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        {loadItemsError ? (
          <Button variant="primary" onClick={loadCatalogItems}>
            {t('Reload catalog items')}
          </Button>
        ) : (
          <Button
            variant="danger"
            isDanger={hasCatalogItems}
            isDisabled={isLoadingItems || isDeleting}
            isLoading={isLoadingItems || isDeleting}
            onClick={deleteAction}
          >
            {hasFailedToDeleteItems ? t('Retry delete') : t('Delete catalog')}
          </Button>
        )}
        <Button variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </FlightCtlModal>
  );
};

export default DeleteCatalogModal;
