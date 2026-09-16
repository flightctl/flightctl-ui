import * as React from 'react';
import { Button, ButtonVariant, ModalBody, ModalFooter, ModalHeader, Stack, StackItem } from '@patternfly/react-core';
import FlightCtlModal from '../../common/FlightCtlModal';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import { useAppLinks } from '../../../hooks/useAppLinks';
import LearnMoreLink from '../../common/LearnMoreLink';
import CheckboxField from '../../form/CheckboxField';
import type { RepositoryFormValues } from './types';

type DeltaStorageSelectionProps = {
  isDisabled?: boolean;
  isEdit?: boolean;
};

const DeltaStorageSelection = ({ isDisabled, isEdit }: DeltaStorageSelectionProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue, setFieldTouched, initialValues } = useFormikContext<RepositoryFormValues>();
  const [showConfirmUnsetDeltaStorage, setShowConfirmUnsetDeltaStorage] = React.useState(false);
  const ociConfig = values.ociConfig as NonNullable<RepositoryFormValues['ociConfig']>;
  const deltaTargetDocLink = useAppLinks('deltaTargetRepo');

  const wasDeltaStorageTarget = Boolean(initialValues.ociConfig?.deltaStorageTarget);

  const onDeltaStorageTargetChange = (checked: boolean) => {
    if (isEdit && wasDeltaStorageTarget && !checked && ociConfig.deltaStorageTarget) {
      setShowConfirmUnsetDeltaStorage(true);
    } else {
      void setFieldValue('ociConfig.deltaStorageTarget', checked);
      if (checked) {
        void setFieldTouched('ociConfig.accessMode', true, false);
      }
    }
  };

  const confirmUnsetDeltaStorage = () => {
    void setFieldValue('ociConfig.deltaStorageTarget', false);
    setShowConfirmUnsetDeltaStorage(false);
  };

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <CheckboxField
            name="ociConfig.deltaStorageTarget"
            label={t('Use as delta repository')}
            description={
              <>
                {t(
                  'Mark this OCI registry for storing generated delta artifacts. Only one delta repository is allowed per organization and it must have read and write access.',
                )}{' '}
                <LearnMoreLink link={deltaTargetDocLink} text={t('View documentation')} />
              </>
            }
            isDisabled={isDisabled}
            noDefaultOnChange
            onChangeCustom={onDeltaStorageTargetChange}
          />
        </StackItem>
      </Stack>
      {showConfirmUnsetDeltaStorage && (
        <FlightCtlModal variant="small" isOpen>
          <ModalHeader title={t('Disable delta storage target?')} titleIconVariant="warning" />
          <ModalBody>
            {t(
              'Removing this registry as the organization delta storage target could disable delta updates for fleets with delta generation enabled.',
            )}{' '}
            {t('Are you sure you want to disable delta storage for this registry?')}
          </ModalBody>
          <ModalFooter>
            <Button key="disable" variant={ButtonVariant.primary} onClick={confirmUnsetDeltaStorage}>
              {t('Disable')}
            </Button>
            <Button key="cancel" variant="link" onClick={() => setShowConfirmUnsetDeltaStorage(false)}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </FlightCtlModal>
      )}
    </>
  );
};

export default DeltaStorageSelection;
