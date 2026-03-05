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
import * as React from 'react';
import { CatalogItem, CatalogItemType } from '@flightctl/types/alpha';

import { useTranslation } from '../../../../hooks/useTranslation';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { InstallAppFormik, InstallOsFormik } from '../types';
import { OS_ITEM_LABEL_KEY } from '../../const';
import { getFullReferenceURI } from '../../utils';
import { DeviceSpec } from '@flightctl/types';
import { Trans } from 'react-i18next';

const isOsUpdate = (
  catalogItem: CatalogItem,
  version: string,
  labels: Record<string, string> | undefined,
  spec: DeviceSpec,
) => {
  const existingOsItem = labels?.[OS_ITEM_LABEL_KEY];
  const catalogItemVersion = catalogItem.spec.versions.find((v) => v.version === version);
  if (existingOsItem === catalogItem.metadata.name && catalogItemVersion) {
    return spec?.os?.image !== getFullReferenceURI(catalogItem.spec.reference.uri, catalogItemVersion);
  }
  return false;
};

type UpdateAlertsProps = {
  catalogItem: CatalogItem;
};

const UpdateAlerts = ({ catalogItem }: UpdateAlertsProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<InstallOsFormik>();

  if (catalogItem.spec.type !== CatalogItemType.CatalogItemTypeOS) {
    return false;
  }

  const osImageName = `${catalogItem.spec.displayName || catalogItem.metadata.name}:${values.version}`;

  if (values.target === 'fleet') {
    const numOfDevices = `${values.fleet?.status?.devicesSummary?.total || 0}`;
    if (!values.fleet?.spec.template.spec.os?.image) {
      return (
        <Alert isInline variant="warning" title={t('Fleet update')}>
          <Trans t={t}>
            This will deploy the OS <strong>{osImageName}</strong> for all <strong>({numOfDevices})</strong> devices in
            the <strong>{values.fleet?.metadata.name}</strong> fleet. Devices will download and apply the update
            according to the configured update policies.
          </Trans>
        </Alert>
      );
    } else {
      if (isOsUpdate(catalogItem, values.version, values.fleet?.metadata.labels, values.fleet?.spec.template.spec)) {
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
            <strong>({numOfDevices})</strong> devices in the <strong>{values.fleet?.metadata.name}</strong> fleet.
            Devices will download and apply the update according to the configured update policies.
          </Trans>
        </Alert>
      );
    }
  } else if (values.target === 'device') {
    if (!values.device?.spec?.os?.image) {
      return (
        <Alert isInline variant="warning" title={t('Device update')}>
          <Trans t={t}>
            This will deploy the OS <strong>{osImageName}</strong>. Device will download and apply the update according
            to the configured update policies.
          </Trans>
        </Alert>
      );
    } else {
      if (isOsUpdate(catalogItem, values.version, values.device?.metadata.labels, values.device?.spec)) {
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

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h3">{t('Review deployment specifications')}</Title>
        </StackItem>
        <UpdateAlerts catalogItem={catalogItem} />
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
                    {values.target === 'fleet'
                      ? values.fleet?.metadata.name
                      : values.device?.metadata.labels?.alias || values.device?.metadata.name}
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
