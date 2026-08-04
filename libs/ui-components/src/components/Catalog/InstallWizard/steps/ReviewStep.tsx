import * as React from 'react';
import { Trans } from 'react-i18next';
import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import type { ImageOrCatalogItemRefSpec } from '@flightctl/types';
import { type CatalogItem, CatalogItemType } from '@flightctl/types/alpha';
import type { InstallAppFormik, InstallOsFormik } from '../types';

import { useTranslation } from '../../../../hooks/useTranslation';
import FlightCtlForm from '../../../form/FlightCtlForm';

const isOsUnset = (osSpec: ImageOrCatalogItemRefSpec | undefined) => !(osSpec?.image || osSpec?.catalogItemRef);

const isOsUpdate = (catalogItem: CatalogItem, version: string, osSpec: ImageOrCatalogItemRefSpec | undefined) => {
  const osRef = osSpec?.catalogItemRef;
  if (!osRef) {
    return false;
  }
  return (
    osRef.item === catalogItem.metadata.name &&
    osRef.catalog === catalogItem.metadata.catalog &&
    osRef.version !== version
  );
};

const isOsUnchanged = (
  osSpec: ImageOrCatalogItemRefSpec | undefined,
  catalogItem: CatalogItem,
  version: string,
  channel: string,
) => {
  const osRef = osSpec?.catalogItemRef;
  if (!osRef) {
    return false;
  }
  return (
    osRef.item === catalogItem.metadata.name &&
    osRef.catalog === catalogItem.metadata.catalog &&
    osRef.version === version &&
    osRef.channel === channel
  );
};

const UpdateOsUpdateAlerts = ({ catalogItem }: { catalogItem: CatalogItem }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<InstallOsFormik>();

  const resourceOs = values.target === 'fleet' ? values.fleet?.spec.template.spec?.os : values.device?.spec?.os;
  const osImageName = `${catalogItem.spec.displayName || catalogItem.metadata.name}:${values.version}`;

  if (values.target === 'fleet') {
    const numOfDevices = `${values.fleet?.status?.devicesSummary?.total || 0}`;
    if (isOsUnset(resourceOs)) {
      return (
        <Alert isInline variant="warning" title={t('Fleet update')}>
          <Trans t={t}>
            This will deploy the OS <strong>{osImageName}</strong> for all <strong>({numOfDevices})</strong> devices in
            the <strong>{values.fleet?.metadata.name}</strong> fleet. Devices will download and apply the update
            according to the configured update policies.
          </Trans>
        </Alert>
      );
    }

    if (isOsUnchanged(resourceOs, catalogItem, values.version, values.channel)) {
      return (
        <Alert isInline variant="info" title={t('No action required')}>
          <Trans t={t}>
            The fleet already defines the selected OS <strong>{osImageName}</strong>. No update will be performed.
          </Trans>
        </Alert>
      );
    }

    if (isOsUpdate(catalogItem, values.version, resourceOs)) {
      return (
        <Alert isInline variant="info" title={t('Version update')}>
          <Trans t={t}>
            You are about to update OS <strong>{osImageName}</strong>. This will update the OS image for all{' '}
            <strong>({numOfDevices})</strong> devices in the <strong>{values.fleet?.metadata.name}</strong> fleet.
            Devices will download and apply the update according to the configured update policies.
          </Trans>
        </Alert>
      );
    }

    return (
      <Alert isInline variant="warning" title={t('Existing OS image detected')}>
        <Trans t={t}>
          You are about to replace OS with <strong>{osImageName}</strong>. This will update the OS image for all{' '}
          <strong>({numOfDevices})</strong> devices in the <strong>{values.fleet?.metadata.name}</strong> fleet. Devices
          will download and apply the update according to the configured update policies.
        </Trans>
      </Alert>
    );
  }

  if (values.target === 'device') {
    if (isOsUnset(resourceOs)) {
      return (
        <Alert isInline variant="warning" title={t('Device update')}>
          <Trans t={t}>
            This will deploy the OS <strong>{osImageName}</strong>. Device will download and apply the update according
            to the configured update policies.
          </Trans>
        </Alert>
      );
    }

    if (isOsUnchanged(resourceOs, catalogItem, values.version, values.channel)) {
      return (
        <Alert isInline variant="info" title={t('No action required')}>
          <Trans t={t}>
            The device already defines the selected OS <strong>{osImageName}</strong>. No update will be performed.
          </Trans>
        </Alert>
      );
    }

    if (isOsUpdate(catalogItem, values.version, resourceOs)) {
      return (
        <Alert isInline variant="info" title={t('Version update')}>
          <Trans t={t}>
            You are about to update OS with <strong>{osImageName}</strong>. Device will download and apply the update
            according to the configured update policies.
          </Trans>
        </Alert>
      );
    }

    return (
      <Alert isInline variant="warning" title={t('Existing OS image detected')}>
        <Trans t={t}>
          You are about to replace OS with <strong>{osImageName}</strong>. Device will download and apply the update
          according to the configured update policies.
        </Trans>
      </Alert>
    );
  }
  return false;
};

type ReviewStepProps = {
  catalogItem: CatalogItem;
  error?: string;
};

const ReviewStep = ({ error, catalogItem }: ReviewStepProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<InstallOsFormik | InstallAppFormik>();

  const isOsCatalogItem = catalogItem.spec.type === CatalogItemType.CatalogItemTypeOS;
  const resourceMeta = values.target === 'fleet' ? values.fleet?.metadata : values.device?.metadata;

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h3">{t('Review deployment specifications')}</Title>
        </StackItem>
        {isOsCatalogItem && <UpdateOsUpdateAlerts catalogItem={catalogItem} />}
        <StackItem>
          <Card>
            <CardTitle>{t('Deployment specifications')}</CardTitle>
            <CardBody>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Channel')}</DescriptionListTerm>
                  <DescriptionListDescription>{values.channel}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Version')}</DescriptionListTerm>
                  <DescriptionListDescription>{values.version}</DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </StackItem>
        <StackItem>
          <Card>
            <CardTitle>{t('Target')}</CardTitle>
            <CardBody>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Target type')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {values.target === 'fleet' ? t('Fleet') : t('Device')}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Target')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {resourceMeta?.labels?.alias || resourceMeta?.name}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </StackItem>
        {error && (
          <StackItem>
            <Alert variant="danger" title={t('Failed to deploy')} isInline>
              {error}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </FlightCtlForm>
  );
};

export default ReviewStep;
