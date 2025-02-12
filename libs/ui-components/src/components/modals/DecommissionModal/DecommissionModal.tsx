import * as React from 'react';
import { Formik } from 'formik';
import { Alert, Button, Modal, Stack, StackItem } from '@patternfly/react-core';

import { DeviceDecommissionTargetType } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { getErrorMessage } from '../../../utils/error';

type DecommissionModalProps = {
  onDecommission: (target: DeviceDecommissionTargetType) => Promise<unknown>;
  onClose: VoidFunction;
};

type DecommissionFormValues = {
  // Currently not implemented - no checkbox to select this option is visible in the UI
  doFactoryReset: boolean;
};

const DecommissionModal = ({ onDecommission, onClose }: DecommissionModalProps) => {
  const { t } = useTranslation();
  const [isDecommissioning, setIsDecommissioning] = React.useState(false);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    // Clean-up after the modal closes for any reason
    return () => {
      setIsDecommissioning(false);
    };
  }, []);

  return (
    <Modal title={t('Decommission device?')} isOpen onClose={onClose} variant="small" titleIconVariant="warning">
      <Formik<DecommissionFormValues>
        initialValues={{
          doFactoryReset: false,
        }}
        onSubmit={({ doFactoryReset }) => {
          const doSubmit = async () => {
            setError(undefined);
            try {
              setIsDecommissioning(true);
              await onDecommission(
                doFactoryReset
                  ? DeviceDecommissionTargetType.DeviceDecommissionTargetTypeFactoryReset
                  : DeviceDecommissionTargetType.DeviceDecommissionTargetTypeUnenroll,
              );
              onClose();
            } catch (err) {
              setError(getErrorMessage(err));
              setIsDecommissioning(false);
            }
          };
          void doSubmit();
        }}
      >
        {({ submitForm }) => {
          return (
            <Stack hasGutter>
              <StackItem>{t('Are you sure you want to proceed with decommissioning this device?')}</StackItem>
              <StackItem>
                {t(
                  'Decommissioned devices will not be able to communicate with the edge management system anymore, and they will be removed from any fleet they were associated to. Once decommissioned, the device cannot be managed further.',
                )}
              </StackItem>
              {error && (
                <StackItem>
                  <Alert isInline variant="danger" title={t('An error occurred')}>
                    {error}
                  </Alert>
                </StackItem>
              )}
              <StackItem>
                <Button
                  key="confirm"
                  variant="danger"
                  isDisabled={isDecommissioning}
                  isLoading={isDecommissioning}
                  onClick={submitForm}
                >
                  {t('Decommission device')}
                </Button>
                <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDecommissioning}>
                  {t('Cancel')}
                </Button>
              </StackItem>
            </Stack>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default DecommissionModal;
