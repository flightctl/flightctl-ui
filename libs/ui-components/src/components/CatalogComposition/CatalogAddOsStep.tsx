import * as React from 'react';
import { Button, Content, ContentVariants, FormGroup, ModalFooter, Stack, StackItem } from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';
import type { CatalogItem } from '@flightctl/types/alpha';
import * as Yup from 'yup';

import { useTranslation } from '../../hooks/useTranslation';
import FormSelect, { type SelectItem } from '../form/FormSelect';
import FlightCtlForm from '../form/FlightCtlForm';
import { CatalogItemDeprecationBadge } from '../Catalog/CatalogItemBadges';
import {
  type CatalogSelectionConfirm,
  buildSelectionConfirm,
  getSortedChannelVersions,
} from './catalogCompositionUtils';

export type OsConfigureFormValues = {
  channel: string;
  version: string;
};

export type CatalogAddOsStepProps = {
  catalogItem: CatalogItem;
  initialValues: OsConfigureFormValues;
  onBack: VoidFunction;
  onConfirm: (selection: CatalogSelectionConfirm) => void;
};

const CatalogAddOsContent = ({ catalogItem, onBack }: { catalogItem: CatalogItem; onBack: VoidFunction }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, submitForm, isSubmitting, isValid } = useFormikContext<OsConfigureFormValues>();

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
          <StackItem>
            <FormGroup label={t('Channel')} fieldId="catalog-os-channel">
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
            <FormGroup label={t('Version')} fieldId="catalog-os-version">
              <FormSelect name="version" items={versionItems} />
            </FormGroup>
          </StackItem>
        </Stack>
      </FlightCtlForm>
      <ModalFooter>
        <Button variant="link" onClick={onBack}>
          {t('Back')}
        </Button>
        <Button variant="primary" onClick={() => void submitForm()} isDisabled={isSubmitting || !isValid}>
          {t('Add to template')}
        </Button>
      </ModalFooter>
    </>
  );
};

const CatalogAddOsStep = ({ catalogItem, initialValues, onBack, onConfirm }: CatalogAddOsStepProps) => {
  const { t } = useTranslation();

  return (
    <Formik<OsConfigureFormValues>
      enableReinitialize
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        channel: Yup.string().required(t('Channel is required')),
        version: Yup.string().required(t('Version is required')),
      })}
      onSubmit={(values) => {
        const version = catalogItem.spec.versions.find((entry) => entry.version === values.version);
        if (!version) {
          return;
        }
        onConfirm(
          buildSelectionConfirm({
            catalogItem,
            version,
            channel: values.channel,
          }),
        );
      }}
    >
      <CatalogAddOsContent catalogItem={catalogItem} onBack={onBack} />
    </Formik>
  );
};

export default CatalogAddOsStep;
