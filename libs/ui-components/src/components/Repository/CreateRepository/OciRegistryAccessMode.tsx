import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Gallery,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { OciRepoSpec } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import FlightCtlModal from '../../common/FlightCtlModal';
import { OciPlacementMode, type RepositoryFormValues } from './types';
import ErrorHelperText from '../../form/FieldHelperText';

const hasReadWriteSettings = (ociConfig: RepositoryFormValues['ociConfig']) =>
  Boolean(ociConfig?.deltaStorageTarget || ociConfig?.repository || ociConfig?.namespace);

const OciRegistryAccessMode = ({ isSelectable }: { isSelectable: boolean }) => {
  const { t } = useTranslation();
  const { values, errors, setFieldValue } = useFormikContext<RepositoryFormValues>();
  const [showConfirmReadOnly, setShowConfirmReadOnly] = React.useState(false);

  const isReadWriteSelected = values.ociConfig?.accessMode === OciRepoSpec.accessMode.READ_WRITE;
  const readWriteError = (errors.ociConfig as unknown as Record<string, string>)?.accessMode;

  const applyAccessMode = (newMode: OciRepoSpec.accessMode) => {
    void setFieldValue('ociConfig.accessMode', newMode);
    if (newMode === OciRepoSpec.accessMode.READ) {
      void setFieldValue('ociConfig.deltaStorageTarget', false);
      void setFieldValue('ociConfig.placementMode', OciPlacementMode.Registry);
      void setFieldValue('ociConfig.repository', '');
      void setFieldValue('ociConfig.namespace', '');
    }
  };

  const onAccessModeChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    if (!checked) {
      return;
    }

    const newMode = isReadWriteSelected ? OciRepoSpec.accessMode.READ : OciRepoSpec.accessMode.READ_WRITE;

    if (newMode === OciRepoSpec.accessMode.READ && hasReadWriteSettings(values.ociConfig)) {
      setShowConfirmReadOnly(true);
      return;
    }

    void setFieldValue('ociConfig.accessMode', newMode);
    applyAccessMode(newMode);
  };

  const confirmSwitchToReadOnly = () => {
    applyAccessMode(OciRepoSpec.accessMode.READ);
    setShowConfirmReadOnly(false);
  };

  // Disable the card that's not selected. Otherwise the styles make it hard to understand what is the current selection.
  const disableSelectReadWrite = !isReadWriteSelected && !isSelectable;
  const disableSelectReadOnly = isReadWriteSelected && !isSelectable;
  return (
    <>
      <Gallery hasGutter minWidths={{ default: '100%', md: '310px' }}>
        <Card
          id="access-mode-read-only-card"
          isSelectable
          isSelected={!isReadWriteSelected}
          isDisabled={disableSelectReadOnly}
          style={{ height: '100%' }}
        >
          <CardHeader
            selectableActions={{
              selectableActionId: OciRepoSpec.accessMode.READ,
              selectableActionAriaLabel: t('Read only'),
              name: 'oci-access-mode',
              variant: 'single',
              onChange: onAccessModeChange,
              isHidden: disableSelectReadOnly,
            }}
          >
            <CardTitle>{t('Read only')}</CardTitle>
          </CardHeader>
          <CardBody>
            {t(
              'Use as a source registry. Fleets and devices can pull images, but the platform will not write content here.',
            )}
          </CardBody>
        </Card>
        <Card
          id="access-mode-read-write-card"
          isSelectable
          isSelected={isReadWriteSelected}
          isDisabled={disableSelectReadWrite}
          style={{ height: '100%' }}
        >
          <CardHeader
            selectableActions={{
              selectableActionId: OciRepoSpec.accessMode.READ_WRITE,
              selectableActionAriaLabel: t('Read and write'),
              name: 'oci-access-mode',
              variant: 'single',
              onChange: onAccessModeChange,
              isHidden: disableSelectReadWrite,
            }}
          >
            <CardTitle>{t('Read and write')}</CardTitle>
          </CardHeader>
          <CardBody>
            {t(
              'Use as a managed registry. The platform can pull images and write content such as image builds and delta updates.',
            )}
          </CardBody>
        </Card>
      </Gallery>
      {readWriteError && <ErrorHelperText error={readWriteError} />}
      {showConfirmReadOnly && (
        <FlightCtlModal variant="small" isOpen>
          <ModalHeader title={t('Switch to read only?')} titleIconVariant="warning" />
          <ModalBody>
            {t(
              'Switching to read only will clear image placement and delta storage settings. These options only apply when the platform can write to the registry.',
            )}{' '}
            {t('Are you sure you want to switch to read only?')}
          </ModalBody>
          <ModalFooter>
            <Button key="switch" variant={ButtonVariant.primary} onClick={confirmSwitchToReadOnly}>
              {t('Switch')}
            </Button>
            <Button key="cancel" variant="link" onClick={() => setShowConfirmReadOnly(false)}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </FlightCtlModal>
      )}
    </>
  );
};

export default OciRegistryAccessMode;
