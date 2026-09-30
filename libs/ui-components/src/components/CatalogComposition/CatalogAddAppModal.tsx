import * as React from 'react';
import { Alert, Button, Flex, FlexItem, ModalBody, ModalFooter, ModalHeader, Title } from '@patternfly/react-core';
import type { CatalogItem } from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';
import FlightCtlModal from '../common/FlightCtlModal';
import {
  type CatalogAdvancedConfigValues,
  type CatalogSelectionConfirm,
  getCatalogItemDefaultAppName,
  getDefaultChannelAndVersion,
} from './catalogCompositionUtils';
import { getInitialAppConfig } from '../Catalog/InstallWizard/utils';
import type { DynamicFormConfigFormik } from '../Catalog/InstallWizard/types';
import CatalogBrowseStep from './CatalogBrowseStep';
import CatalogAddAppStep, { type ConfigureFormValues } from './CatalogAddAppStep';
import CatalogAddSettingsStep from './CatalogAddSettingsStep';
import { CatalogItemDeprecationBadge } from '../Catalog/CatalogItemBadges';
import { getAppType } from '../../utils/catalog';

type CatalogAddAppModalProps = {
  appName?: string;
  onClose: VoidFunction;
  onConfirm: (
    selection: CatalogSelectionConfirm,
    appName: string,
    advancedConfig?: CatalogAdvancedConfigValues,
  ) => void;
};

enum Step {
  Browse = 'browse',
  SelectVersion = 'select-version',
  AddSettings = 'add-settings',
}

const CatalogAddAppModal = ({ appName = '', onClose, onConfirm }: CatalogAddAppModalProps) => {
  const { t } = useTranslation();
  const [step, setStep] = React.useState<Step>(Step.Browse);
  const [selectedItem, setSelectedItem] = React.useState<CatalogItem | null>(null);
  const [pendingConfigureValues, setPendingConfigureValues] = React.useState<ConfigureFormValues | null>(null);
  const [pendingSelection, setPendingSelection] = React.useState<CatalogSelectionConfirm | null>(null);
  const [invalidAppType, setInvalidAppType] = React.useState<string>();

  const handleClose = () => {
    onClose();
  };

  const defaultAppName = React.useMemo(() => {
    if (appName || !selectedItem) {
      return appName;
    }
    return getCatalogItemDefaultAppName(selectedItem);
  }, [selectedItem, appName]);

  const configureInitialValues = React.useMemo((): ConfigureFormValues => {
    if (!selectedItem) {
      return { channel: 'stable', version: '', appName, wantAdvancedConfig: false };
    }
    const { channel, version } = getDefaultChannelAndVersion(selectedItem);
    return {
      channel,
      version,
      appName: defaultAppName,
      wantAdvancedConfig: false,
    };
  }, [selectedItem, appName, defaultAppName]);

  const advancedInitialValues = React.useMemo((): DynamicFormConfigFormik | null => {
    if (!selectedItem || !pendingConfigureValues) {
      return null;
    }
    const appConfig = getInitialAppConfig(selectedItem, pendingConfigureValues.version);
    return {
      ...appConfig,
      appName: pendingConfigureValues.appName,
    };
  }, [selectedItem, pendingConfigureValues]);

  return (
    <FlightCtlModal variant="large" isOpen onClose={handleClose}>
      <ModalHeader title={t('Add application from Software Catalog')}>
        {(step === Step.SelectVersion || step === Step.AddSettings) && selectedItem && (
          <Flex>
            <FlexItem>
              <Title headingLevel="h2" size="md">
                {selectedItem.spec.displayName || selectedItem.metadata.name}
              </Title>
            </FlexItem>
            {selectedItem?.spec.deprecation?.message && step === Step.SelectVersion && (
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
            mode="apps"
            onSelect={(item) => {
              const appType = getAppType(item);
              if (appType) {
                setSelectedItem(item);
                setStep(Step.SelectVersion);
                setInvalidAppType(undefined);
              } else {
                setInvalidAppType(item.spec.type);
              }
            }}
          />
        )}

        {step === Step.SelectVersion && selectedItem && (
          <CatalogAddAppStep
            catalogItem={selectedItem}
            initialValues={configureInitialValues}
            onBack={() => setStep(Step.Browse)}
            onConfirm={(selection, confirmedAppName) => {
              onConfirm(selection, confirmedAppName);
              handleClose();
            }}
            onContinueToAdvanced={(values, selection) => {
              setPendingConfigureValues(values);
              setPendingSelection(selection);
              setStep(Step.AddSettings);
            }}
          />
        )}

        {step === Step.AddSettings && selectedItem && advancedInitialValues && pendingSelection && (
          <CatalogAddSettingsStep
            initialValues={advancedInitialValues}
            onBack={() => setStep(Step.SelectVersion)}
            onConfirm={(advancedConfig) => {
              const name = pendingConfigureValues?.appName;
              if (name) {
                onConfirm(pendingSelection, name, advancedConfig);
                handleClose();
              }
            }}
          />
        )}
        {invalidAppType && (
          <Alert variant="danger" title={t('Unsupported application type')} className="pf-v6-u-mt-md">
            {t('Applications of type {{appType}} are not supported via the console.', { appType: invalidAppType })}
          </Alert>
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

export default CatalogAddAppModal;
