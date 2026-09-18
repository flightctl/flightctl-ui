import * as React from 'react';
import { Button, Content, ContentVariants, FormGroup, ModalFooter, Stack, StackItem } from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';
import type { CatalogItem } from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';
import FormSelect, { type SelectItem } from '../form/FormSelect';
import FlightCtlForm from '../form/FlightCtlForm';
import { CatalogItemDeprecationBadge } from '../Catalog/CatalogItemBadges';
import {
  type CatalogSelectionConfirm,
  buildSelectionConfirm,
  getAppNameValidationSchema,
  getSortedChannelVersions,
  isAdvancedConfigRequired,
} from './catalogCompositionUtils';
import CatalogDefinitionFields from './CatalogDefinitionFields';

export type ConfigureFormValues = {
  channel: string;
  version: string;
  appName: string;
  wantAdvancedConfig: boolean;
};

export type CatalogAddAppStepProps = {
  catalogItem: CatalogItem;
  initialValues: ConfigureFormValues;
  onBack: VoidFunction;
  onConfirm: (selection: CatalogSelectionConfirm, appName: string) => void;
  onContinueToAdvanced: (values: ConfigureFormValues, selection: CatalogSelectionConfirm) => void;
};

const CatalogAddAppContent = ({ catalogItem, onBack }: { catalogItem: CatalogItem; onBack: VoidFunction }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, submitForm, isSubmitting, isValid } = useFormikContext<ConfigureFormValues>();

  const [requiresAdvancedConfig, setRequiresAdvancedConfig] = React.useState<boolean | undefined>(undefined);
  const goToAdvancedConfig = requiresAdvancedConfig || values.wantAdvancedConfig;

  React.useEffect(() => {
    const val = isAdvancedConfigRequired(catalogItem, values.version);
    setRequiresAdvancedConfig(val);
    void setFieldValue('wantAdvancedConfig', val);
  }, [catalogItem, values.version, setFieldValue]);

  const channelVersions = getSortedChannelVersions(catalogItem, values.channel);
  const versionItems = channelVersions.reduce<Record<string, SelectItem>>((acc, entry) => {
    const item: SelectItem = { label: entry.version };
    const deprecationMessage = entry.deprecation?.message;
    if (deprecationMessage) {
      item.description = (
        <span>
          <CatalogItemDeprecationBadge mode="version" /> {deprecationMessage}
        </span>
      );
    }
    acc[entry.version] = item;
    return acc;
  }, {});

  const channels = catalogItem.spec.versions.reduce<Record<string, string>>((acc, entry) => {
    entry.channels.forEach((channel) => {
      acc[channel] = channel;
    });
    return acc;
  }, {});

  return (
    <>
      <FlightCtlForm>
        <Stack hasGutter>
          {catalogItem.spec.shortDescription && (
            <StackItem>
              <Content component={ContentVariants.p}>{catalogItem.spec.shortDescription}</Content>
            </StackItem>
          )}
          <CatalogDefinitionFields requiresAdvancedConfig={requiresAdvancedConfig || false}>
            <StackItem>
              <FormGroup label={t('Channel')} fieldId="catalog-channel">
                <FormSelect
                  name="channel"
                  items={channels}
                  onChange={(channel) => {
                    const versions = getSortedChannelVersions(catalogItem, channel);
                    const nextVersion = versions.some((entry) => entry.version === values.version)
                      ? values.version
                      : versions[0]?.version || '';
                    if (nextVersion !== values.version) {
                      void setFieldValue('version', nextVersion, true);
                    }
                  }}
                />
              </FormGroup>
            </StackItem>
            <StackItem>
              <FormGroup label={t('Version')} fieldId="catalog-version">
                <FormSelect name="version" items={versionItems} />
              </FormGroup>
            </StackItem>
          </CatalogDefinitionFields>
        </Stack>
      </FlightCtlForm>
      <ModalFooter>
        <Button variant="link" onClick={onBack}>
          {t('Back')}
        </Button>
        <Button variant="primary" onClick={() => void submitForm()} isDisabled={isSubmitting || !isValid}>
          {goToAdvancedConfig ? t('Next') : t('Add to template')}
        </Button>
      </ModalFooter>
    </>
  );
};

const CatalogAddAppStep = ({
  catalogItem,
  initialValues,
  onBack,
  onConfirm,
  onContinueToAdvanced,
}: CatalogAddAppStepProps) => {
  const { t } = useTranslation();

  return (
    <Formik<ConfigureFormValues>
      enableReinitialize
      initialValues={initialValues}
      validationSchema={getAppNameValidationSchema(t)}
      onSubmit={(values) => {
        const version = catalogItem.spec.versions.find((entry) => entry.version === values.version);
        if (!version) {
          return;
        }
        const selection = buildSelectionConfirm({
          catalogItem,
          version,
          channel: values.channel,
        });
        if (values.wantAdvancedConfig) {
          onContinueToAdvanced(values, selection);
          return;
        }
        onConfirm(selection, values.appName);
      }}
    >
      <CatalogAddAppContent catalogItem={catalogItem} onBack={onBack} />
    </Formik>
  );
};

export default CatalogAddAppStep;
