import * as React from 'react';
import { Alert, Button, Modal, Stack, StackItem } from '@patternfly/react-core';
import { Trans } from 'react-i18next';

import { Fleet, ResourceSync } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import { getOwnerName } from '../FleetDetails/FleetOwnerLink';

const DeleteFleetModal = ({ fleetId, onClose }: { fleetId: string; onClose: (hasDeleted?: boolean) => void }) => {
  const { t } = useTranslation();
  const { get, remove } = useFetch();

  const [error, setError] = React.useState<{ text: string; details?: string }>();
  const [isLoading, setIsLoading] = React.useState<boolean>();
  const [isDeleting, setIsDeleting] = React.useState<boolean>();
  const [fleetDetails, setFleetDetails] = React.useState<Fleet>();
  const rsId = getOwnerName(fleetDetails?.metadata.owner);
  const isManagedFleet = !!fleetDetails?.metadata.owner;
  const showManagedConfirmation = !isLoading && !error && isManagedFleet;
  const showBasicConfirmation = !isLoading && !error && !isManagedFleet;

  const verifyResourceSyncExists = React.useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await get<ResourceSync>(`resourcesyncs/${id}`);
      } catch (e) {
        setError({
          text: t(
            'This fleet is managed by the resource sync {{id}}, but its details could not be loaded. Please try again.',
            { id },
          ),
          details: getErrorMessage(e),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [t, get],
  );

  const fetchFleetDetails = React.useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        const details = await get<Fleet>(`fleets/${id}`);
        const newRsId = getOwnerName(details.metadata.owner);
        if (newRsId) {
          await verifyResourceSyncExists(newRsId);
        }
        setFleetDetails(details);
      } catch (e) {
        setError({ text: t('Failed to load the fleet details, please try again.'), details: getErrorMessage(e) });
      } finally {
        setIsLoading(false);
      }
    },
    [t, get, verifyResourceSyncExists],
  );

  React.useEffect(() => {
    void fetchFleetDetails(fleetId);
  }, [fleetId, fetchFleetDetails]);

  const onDelete = async () => {
    if (rsId) {
      try {
        await remove(`resourcesyncs/${rsId}`);
      } catch (rsErr) {
        // An API validation must have failed, since deleting non-existing elements does not raise errors
        setError({ text: t('The resource sync could not be deleted.'), details: getErrorMessage(rsErr) });
        return;
      }

      // In order to proceed, we must confirm that after deleting the RS, the fleet does not have an owner
      const updatedFleet = await get<Fleet>(`fleets/${fleetId}`);
      const updatedRsOwner = getOwnerName(updatedFleet.metadata.owner);
      if (updatedRsOwner) {
        setError({
          text: t(
            'The resource sync {{rsId}} has been deleted. However, the fleet still reports it is owned by {{updatedRsOwner}} and it cannot be deleted at the moment.',
            { rsId, updatedRsOwner },
          ),
        });
        return;
      }
    }

    try {
      await remove(`fleets/${fleetId}`);
    } catch (fleetErr) {
      setError({ text: t('Deletion of fleet {{fleetId}} failed.'), details: getErrorMessage(fleetErr) });
    }
  };

  return (
    <Modal
      title={t('Delete fleet ?')}
      isOpen
      onClose={() => {
        onClose();
      }}
      variant="small"
      titleIconVariant={rsId ? undefined : 'warning'}
      actions={[
        <Button
          key="confirm"
          variant="danger"
          isDisabled={isLoading || isDeleting || !!error}
          isLoading={isLoading || isDeleting}
          onClick={async () => {
            setError(undefined);
            try {
              setIsDeleting(true);
              await onDelete();
              onClose(true);
            } finally {
              setIsDeleting(false);
            }
          }}
        >
          {rsId ? t('Delete fleet and resource sync') : t('Delete')}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            onClose();
          }}
          isDisabled={isDeleting}
        >
          {t('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        {isLoading && <StackItem>{t('Please wait while the fleet details are being loaded.')}</StackItem>}
        {showBasicConfirmation && (
          <StackItem>
            <Trans t={t}>
              Are you sure you want to delete fleet <strong>{fleetId}</strong>?
            </Trans>
          </StackItem>
        )}
        {showManagedConfirmation && (
          <>
            <StackItem>
              <Alert variant="warning" isInline title={t('Fleet is managed')}>
                <Trans t={t}>
                  <strong>{fleetId}</strong> is a managed fleet. The resource sync <strong>{rsId}</strong> that manages
                  the fleet will also be deleted.
                </Trans>
              </Alert>
            </StackItem>
            <StackItem>{t('Are you sure you want to continue?')}</StackItem>
          </>
        )}
        {error && (
          <StackItem>
            <Alert isInline variant="danger" title={t('An error occurred')}>
              <div>{error.text}</div>
              {error.details && <div>{t('Details: {{errorDetails}}', { errorDetails: error.details })}</div>}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

export default DeleteFleetModal;
