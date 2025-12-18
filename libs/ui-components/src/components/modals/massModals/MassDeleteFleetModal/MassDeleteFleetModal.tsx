import * as React from 'react';
import {
	Alert,
	Button,
	ExpandableSection,
	Progress,
	ProgressMeasureLocation,
	Stack,
	StackItem,
	Modal /* data-codemods */,
	ModalBody /* data-codemods */,
	ModalFooter /* data-codemods */,
	ModalHeader /* data-codemods */
} from '@patternfly/react-core';

import { Fleet } from '@flightctl/types';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { getErrorMessage } from '../../../../utils/error';
import { useFetch } from '../../../../hooks/useFetch';
import FleetOwnerLink from '../../../Fleet/FleetDetails/FleetOwnerLink';
import { useTranslation } from '../../../../hooks/useTranslation';
import { isPromiseRejected } from '../../../../types/typeUtils';

type MassDeleteFleetModalProps = {
  onClose: VoidFunction;
  fleets: Array<Fleet>;
  onDeleteSuccess: VoidFunction;
};

const MassDeleteFleetTable = ({ fleets }: { fleets: Array<Fleet> }) => {
  const { t } = useTranslation();
  return (
    <Table>
      <Thead>
        <Tr>
          <Th modifier="fitContent">{t('Name')}</Th>
          <Th modifier="fitContent">{t('Managed by')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {fleets.map((fleet) => {
          const name = fleet.metadata.name as string;
          return (
            <Tr key={name}>
              <Td dataLabel={t('Name')}>{name}</Td>
              <Td dataLabel={t('Managed by')}>
                <FleetOwnerLink owner={fleet.metadata.owner} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

const MassDeleteFleetModal: React.FC<MassDeleteFleetModalProps> = ({ onClose, fleets, onDeleteSuccess }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = React.useState(0);
  const [progressTotal, setProgressTotal] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>();
  const { remove } = useFetch();

  const fleetsToDelete = fleets.filter((r) => !r.metadata.owner);
  const fleetsToSkip = fleets.filter((r) => r.metadata.owner);

  const deleteFleets = async () => {
    setProgress(0);
    setIsDeleting(true);
    const promises = fleetsToDelete.map(async (r) => {
      await remove(`fleets/${r.metadata.name}`);
      setProgress((p) => p + 1);
    });

    setProgressTotal(promises.length);
    const results = await Promise.allSettled(promises);
    setIsDeleting(false);

    const rejectedResults = results.filter(isPromiseRejected);

    if (rejectedResults.length) {
      setErrors(rejectedResults.map((r) => getErrorMessage(r.reason)));
    } else {
      onDeleteSuccess();
    }
  };

  if (fleetsToDelete.length === 0) {
    return (
      <Modal isOpen onClose={onClose} variant="medium">
        <ModalHeader title={t('Delete fleets')} />
        <ModalBody>
          <Stack hasGutter>
            <StackItem>
              <Alert
                variant="info"
                isInline
                title={t(
                  'All the fleets you selected are managed by a resource sync and cannot be deleted. You can remove each fleet individually. Alternatively, to delete multiple fleets, first delete the resource syncs from the related repositories inside the "Repositories" tab.',
                )}
              />
            </StackItem>
            <StackItem>
              <MassDeleteFleetTable fleets={fleets} />
            </StackItem>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button key="close" variant="primary" onClick={onClose}>
            {t('Close')}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={isDeleting ? undefined : onClose} variant="medium">
      <ModalHeader title={t('Delete fleets ?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            {t(
              'The following fleets will be deleted and as a result, the devices managed by them will be left unmanaged. Are you sure you want to delete the listed fleets?',
            )}
          </StackItem>
          <StackItem>
            <MassDeleteFleetTable fleets={fleetsToDelete} />
          </StackItem>

          {fleetsToSkip.length > 0 && (
            <>
              <StackItem>
                <Alert
                  variant="info"
                  isInline
                  title={t(
                    `Some fleets you selected are managed by a resource sync and cannot be deleted. To remove those fleets, delete the resource syncs from the related repositories inside the "Repositories" tab.`,
                  )}
                />
              </StackItem>
              <StackItem>
                <ExpandableSection toggleText={t('Show fleets')}>
                  <MassDeleteFleetTable fleets={fleetsToSkip} />
                </ExpandableSection>
              </StackItem>
            </>
          )}

          {isDeleting && (
            <StackItem>
              <Progress
                value={progress}
                min={0}
                max={progressTotal}
                title={t('Deleting...')}
                measureLocation={ProgressMeasureLocation.top}
                label={t('{{progress}} of {{progressTotal}}', { progress, progressTotal })}
                valueText={t('{{progress}} of {{progressTotal}}', { progress, progressTotal })}
              />
            </StackItem>
          )}
          {errors?.length && (
            <StackItem>
              <Alert isInline variant="danger" title={t('An error occurred')}>
                <Stack hasGutter>
                  {errors.map((e, index) => (
                    <StackItem key={index}>{e}</StackItem>
                  ))}
                </Stack>
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button key="delete" variant="danger" onClick={deleteFleets} isLoading={isDeleting} isDisabled={isDeleting}>
          {t('Delete fleets')}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MassDeleteFleetModal;
