import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Label,
  LabelGroup,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import {
  type ApplicationEntry,
  type DeviceSpecConfigFormValues,
  type EditDeviceFormValues,
  type ManualAppForm,
  UpdateMode,
  isCatalogAppEntry,
} from '../../../types/deviceSpec';
import { useTranslation } from '../../../hooks/useTranslation';
import { getAppTypeLabel } from '../../../utils/catalogTypes';
import { RepositorySourcePlainList } from '../../Repository/RepositoryDetails/RepositorySourceList';
import CatalogRefReviewDetails from '../../CatalogRef/CatalogRefReviewDetails';
import { getApiConfig } from './deviceSpecUtils';
import { useSystemImage } from './useSystemImage';
import { ReviewUpdatePolicy } from './steps/ReviewUpdatePolicy';
import LabelsView from '../../common/LabelsView';
import { toAPILabel } from '../../../utils/labels';
import type { FlightCtlLabel } from '../../../types/extraTypes';

export const ReviewCard = ({ title, children }: React.PropsWithChildren<{ title: string }>) => (
  <StackItem>
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardBody>{children}</CardBody>
    </Card>
  </StackItem>
);

const ManualApplicationReviewDetails = ({ app }: { app: ManualAppForm }) => {
  const { t } = useTranslation();
  const name = app.name || t('Unnamed application');
  const imageRef = 'image' in app && app.image ? app.image : undefined;

  return (
    <DescriptionList isHorizontal isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
        <DescriptionListDescription>{name}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Label isCompact variant="filled" color="purple">
            {getAppTypeLabel(app.appType, t)}
          </Label>
        </DescriptionListDescription>
      </DescriptionListGroup>
      {imageRef && (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Image reference')}</DescriptionListTerm>
          <DescriptionListDescription>{imageRef}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};

export const SystemImageReviewCard = ({
  values,
  showUpdateStatus,
}: {
  values: DeviceSpecConfigFormValues;
  showUpdateStatus?: boolean;
}) => {
  const { t } = useTranslation();
  const imageResult = useSystemImage(values.osSpec);
  const catalogItemRef = values.osSpec?.catalogItemRef;

  if (!values.osSpec?.image && !catalogItemRef) {
    return null;
  }

  let content: React.ReactNode;
  if (catalogItemRef) {
    content = <CatalogRefReviewDetails catalogItemRef={catalogItemRef} showUpdateStatus={showUpdateStatus} />;
  } else if (imageResult.isLoading) {
    content = <Spinner size="sm" />;
  } else {
    content = (
      <DescriptionList isHorizontal isCompact>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Image reference')}</DescriptionListTerm>
          <DescriptionListDescription>{imageResult.imageUri || values.osSpec?.image}</DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    );
  }

  return <ReviewCard title={t('System image')}>{content}</ReviewCard>;
};

export const ConfigurationsReviewCard = ({ values }: { values: DeviceSpecConfigFormValues }) => {
  const { t } = useTranslation();

  if (values.configTemplates.length === 0) {
    return null;
  }

  return (
    <ReviewCard title={t('Configurations')}>
      <RepositorySourcePlainList configs={values.configTemplates.map(getApiConfig)} />
    </ReviewCard>
  );
};

export const ApplicationWorkloadsReviewCard = ({
  apps,
  showUpdateStatus,
}: {
  apps: ApplicationEntry[];
  showUpdateStatus?: boolean;
}) => {
  const { t } = useTranslation();

  if (apps.length === 0) {
    return null;
  }

  return (
    <ReviewCard title={t('Application workloads')}>
      <Stack hasGutter>
        {apps.map((entry, index) => {
          return (
            <StackItem key={`review-app-${index}`}>
              {index > 0 && <Divider className="pf-v6-u-my-sm" />}
              {isCatalogAppEntry(entry) ? (
                <CatalogRefReviewDetails
                  catalogItemRef={entry.app.catalogItemRef}
                  name={entry.app.name}
                  showUpdateStatus={showUpdateStatus}
                />
              ) : (
                <ManualApplicationReviewDetails app={entry.app} />
              )}
            </StackItem>
          );
        })}
      </Stack>
    </ReviewCard>
  );
};

export const SystemdUnitsReviewCard = ({ values }: { values: DeviceSpecConfigFormValues }) => {
  const { t } = useTranslation();

  if (values.systemdUnits.length === 0) {
    return null;
  }

  return (
    <ReviewCard title={t('Tracked systemd services')}>
      <LabelGroup>
        {values.systemdUnits.map((systemD, index) => (
          <Label key={`${systemD.pattern}_${index}`}>{systemD.pattern}</Label>
        ))}
      </LabelGroup>
    </ReviewCard>
  );
};

export const ReviewLabelSection = ({ title, labels }: { title: string; labels: FlightCtlLabel[] }) => {
  if (labels.length === 0) {
    return null;
  }

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{title}</DescriptionListTerm>
      <DescriptionListDescription>
        <LabelsView prefix={title} labels={toAPILabel(labels)} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

type UpdateSubform = Pick<EditDeviceFormValues, 'updateMode' | 'updatePolicy'>;
export const DeviceSpecUpdatesReviewCard = ({
  values,
  children,
}: React.PropsWithChildren<{ values: UpdateSubform }>) => {
  const { t } = useTranslation();

  if (values.updateMode === UpdateMode.Default && !children) {
    return null;
  }

  return (
    <ReviewCard title={t('Updates')}>
      <DescriptionList isHorizontal isCompact>
        {children}
        {(values.updatePolicy?.isCustomized || values.updateMode === UpdateMode.Customized) && (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Maintenance windows')}</DescriptionListTerm>
            <DescriptionListDescription>
              <ReviewUpdatePolicy updatePolicy={values.updatePolicy} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>
    </ReviewCard>
  );
};
