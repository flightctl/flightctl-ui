import * as React from 'react';
import { Button, Flex, FlexItem, ModalBody, ModalFooter, ModalHeader, Title } from '@patternfly/react-core';
import type { CatalogItem } from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';
import FlightCtlModal from '../common/FlightCtlModal';
import { type CatalogSelectionConfirm, getDefaultChannel, getSortedChannelVersions } from './catalogCompositionUtils';
import CatalogBrowseStep from './CatalogBrowseStep';
import CatalogAddOsStep, { type OsConfigureFormValues } from './CatalogAddOsStep';
import { CatalogItemDeprecationBadge } from '../Catalog/CatalogItemBadges';

type CatalogAddOsModalProps = {
  onClose: VoidFunction;
  onConfirm: (selection: CatalogSelectionConfirm) => void;
};

enum Step {
  Browse = 'browse',
  Configure = 'configure',
}

const CatalogAddOsModal = ({ onClose, onConfirm }: CatalogAddOsModalProps) => {
  const { t } = useTranslation();
  const [step, setStep] = React.useState<Step>(Step.Browse);
  const [selectedItem, setSelectedItem] = React.useState<CatalogItem | null>(null);

  const handleClose = () => {
    onClose();
  };

  const configureInitialValues = React.useMemo((): OsConfigureFormValues => {
    if (!selectedItem) {
      return { channel: 'stable', version: '' };
    }
    const channel = getDefaultChannel(selectedItem);
    const versions = getSortedChannelVersions(selectedItem, channel);
    return {
      channel,
      version: versions[0]?.version || '',
    };
  }, [selectedItem]);

  return (
    <FlightCtlModal variant="large" isOpen onClose={handleClose}>
      <ModalHeader title={t('Add system image from Software Catalog')}>
        {step === Step.Configure && selectedItem && (
          <Flex>
            <FlexItem>
              <Title headingLevel="h2" size="md">
                {selectedItem.spec.displayName || selectedItem.metadata.name}
              </Title>
            </FlexItem>
            {selectedItem.spec.deprecation?.message && (
              <FlexItem>
                <CatalogItemDeprecationBadge mode="item" />
              </FlexItem>
            )}
          </Flex>
        )}
      </ModalHeader>
      <ModalBody>
        {step === Step.Browse && (
          <CatalogBrowseStep
            mode="os"
            onSelect={(item) => {
              setSelectedItem(item);
              setStep(Step.Configure);
            }}
          />
        )}

        {step === Step.Configure && selectedItem && (
          <CatalogAddOsStep
            catalogItem={selectedItem}
            initialValues={configureInitialValues}
            onBack={() => setStep(Step.Browse)}
            onConfirm={(selection) => {
              onConfirm(selection);
              handleClose();
            }}
          />
        )}
      </ModalBody>
      {step === Step.Browse && (
        <ModalFooter>
          <Button variant="link" onClick={handleClose}>
            {t('Cancel')}
          </Button>
        </ModalFooter>
      )}
    </FlightCtlModal>
  );
};

export default CatalogAddOsModal;
