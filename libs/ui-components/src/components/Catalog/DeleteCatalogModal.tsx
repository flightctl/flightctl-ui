import * as React from 'react';
import { Trans } from 'react-i18next';
import {
  Alert,
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { CatalogItemList } from '@flightctl/types/alpha';

import { getErrorMessage } from '../../utils/error';
import { useFetch } from '../../hooks/useFetch';
import { useTranslation } from '../../hooks/useTranslation';

type DeleteCatalogModalProps = {
  onClose: VoidFunction;
  onDeleteSuccess: VoidFunction;
  catalogId: string;
  catalogDisplayName: string;
};

const DeleteCatalogModal = ({ catalogId, catalogDisplayName, onClose, onDeleteSuccess }: DeleteCatalogModalProps) => {
  const { t } = useTranslation();
  const { get, remove } = useFetch();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [itemsError, setItemsError] = React.useState<unknown>();
  const [message, setMessage] = React.useState<string>();
  const [catalogItemIds, setCatalogItemIds] = React.useState<string[]>();
  const isLoadingItems = catalogItemIds === undefined;
  const hasCatalogItems = !isLoadingItems && catalogItemIds.length > 0;

  const deleteCatalogAndItems = async () => {
    const toDeleteItems = catalogItemIds?.length || 0;
    let deletedCount = 0;
    if (toDeleteItems > 0) {
      setMessage(t('Deleting {{count}} catalog item', { count: toDeleteItems }));
      const promises = (catalogItemIds || []).map((id) => remove(`catalogs/${catalogId}/items/${id}`));
      const results = await Promise.allSettled(promises);
      deletedCount = results.filter((result) => result.status === 'fulfilled').length;
    }

    const nonDeletedItems = toDeleteItems - deletedCount;
    if (nonDeletedItems !== 0) {
      setError(t('{{count}} catalog item could not be deleted. Try deleting it manually.', { count: nonDeletedItems }));
      return false;
    }
    setCatalogItemIds([]);
    await remove(`catalogs/${catalogId}`);
    return true;
  };

  const loadCatalogItems = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('fieldSelector', `metadata.catalog in (${catalogId})`);
      const items = await get<CatalogItemList>(`catalogitems?${params.toString()}`);
      setCatalogItemIds(items.items.map((item) => item.metadata.name || ''));
      setItemsError(undefined);
    } catch (e) {
      setItemsError(e);
      setCatalogItemIds([]);
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

  return (
    <Modal isOpen onClose={onClose} variant={hasCatalogItems ? 'medium' : 'small'}>
      <ModalHeader title={t('Delete catalog ?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          {hasCatalogItems && (
            <StackItem>
              <Content component="p">
                {t(
                  'This catalog contains catalog items. By deleting the catalog, its catalog items will also be deleted.',
                )}
              </Content>
            </StackItem>
          )}
          {itemsError ? (
            <Alert isInline variant="warning" title={t('Cannot delete catalog')}>
              {t(
                `The catalog cannot be safely deleted at this moment, as we couldn't determine if the catalog contains items. Detail: {{detail}}`,
                { detail: getErrorMessage(itemsError) },
              )}
            </Alert>
          ) : (
            <StackItem>
              <Trans t={t}>
                Are you sure you want to delete the catalog <b>{catalogDisplayName}</b>?
              </Trans>
            </StackItem>
          )}
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
        </Stack>
      </ModalBody>
      <ModalFooter>
        {itemsError ? (
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
            {t('Delete catalog')}
          </Button>
        )}
        <Button variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteCatalogModal;
