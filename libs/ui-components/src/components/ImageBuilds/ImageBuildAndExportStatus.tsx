import * as React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { TFunction } from 'react-i18next';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import { PendingIcon } from '@patternfly/react-icons/dist/js/icons/pending-icon';

import {
  ImageBuildCondition,
  ImageBuildConditionReason,
  ImageBuildConditionType,
  ImageBuildStatus,
  ImageExportCondition,
  ImageExportConditionReason,
  ImageExportConditionType,
  ImageExportStatus,
} from '@flightctl/types/imagebuilder';
import { useTranslation } from '../../hooks/useTranslation';
import { StatusLevel } from '../../utils/status/common';
import { StatusDisplayContent } from '../Status/StatusDisplay';
import ImageUrl from './ImageUrl';

type ImageBuildStatusProps = {
  buildStatus?: ImageBuildStatus;
};

type ImageExportStatusProps = {
  imageStatus?: ImageExportStatus;
  imageReference?: string;
};

type LevelAndLabel = {
  level: StatusLevel;
  label: string;
  customIcon?: React.ComponentClass<SVGIconProps>;
};

const getQueuedStatusInfo = (t: TFunction): LevelAndLabel => ({
  level: 'unknown',
  label: t('Queued'),
  customIcon: PendingIcon,
});

const getImageBuildStatusInfo = (condition: ImageBuildCondition | undefined, t: TFunction): LevelAndLabel => {
  // Without the Ready condition, the build wouldn't be even queued for processing.
  if (!condition) {
    return { level: 'unknown', label: t('Unknown') };
  }

  switch (condition.reason) {
    case ImageBuildConditionReason.ImageBuildConditionReasonPending:
      return getQueuedStatusInfo(t);
    case ImageBuildConditionReason.ImageBuildConditionReasonBuilding:
      return { level: 'info', label: t('Building') };
    case ImageBuildConditionReason.ImageBuildConditionReasonPushing:
      return { level: 'info', label: t('Pushing') };
    case ImageBuildConditionReason.ImageBuildConditionReasonCompleted:
      return { level: 'success', label: t('Complete') };
    case ImageBuildConditionReason.ImageBuildConditionReasonFailed:
      return { level: 'danger', label: t('Failed') };
    case ImageBuildConditionReason.ImageBuildConditionReasonCanceling:
      return { level: 'warning', label: t('Canceling') };
    case ImageBuildConditionReason.ImageBuildConditionReasonCanceled:
      return { level: 'warning', label: t('Canceled') };
    case ImageBuildConditionReason.ImageBuildConditionReasonGeneratingSBOM:
      return { level: 'info', label: t('Scanning for vulnerabilities') };
    default:
      return { level: 'unknown', label: t('Unknown') };
  }
};

const getImageExportStatusInfo = (condition: ImageExportCondition | undefined, t: TFunction): LevelAndLabel => {
  const reason = condition?.reason;
  switch (reason) {
    case ImageExportConditionReason.ImageExportConditionReasonPending:
      // ImageExports will have a "pending" state while their associated imageBuild is incomplete.
      return getQueuedStatusInfo(t);
    case ImageExportConditionReason.ImageExportConditionReasonConverting:
      // Main status while the export image is being generated
      return { level: 'info', label: t('Converting') };
    case ImageExportConditionReason.ImageExportConditionReasonPushing:
      return { level: 'info', label: t('Pushing') };
    case ImageExportConditionReason.ImageExportConditionReasonCompleted:
      return { level: 'success', label: t('Complete') };
    case ImageExportConditionReason.ImageExportConditionReasonFailed:
      return { level: 'danger', label: t('Failed') };
    case ImageExportConditionReason.ImageExportConditionReasonCanceling:
      return { level: 'warning', label: t('Canceling') };
    case ImageExportConditionReason.ImageExportConditionReasonCanceled:
      return { level: 'warning', label: t('Canceled') };
    default:
      return { level: 'unknown', label: t('Unknown') };
  }
};

const ImageBuildAndExportStatus = ({
  level,
  label,
  message,
  imageReference,
  customIcon,
}: {
  level: StatusLevel;
  label: string;
  message: React.ReactNode | undefined;
  imageReference: string | undefined;
  customIcon?: React.ComponentClass<SVGIconProps>;
}) => {
  const { t } = useTranslation();
  if (imageReference) {
    message = (
      <Stack hasGutter>
        <StackItem>{t('Image built successfully')}</StackItem>
        <StackItem>
          <ImageUrl imageReference={imageReference} />
        </StackItem>
      </Stack>
    );
  }

  return <StatusDisplayContent label={label} level={level} message={message} customIcon={customIcon} />;
};

export const ImageBuildStatusDisplay = ({ buildStatus }: ImageBuildStatusProps) => {
  const { t } = useTranslation();

  const conditions = buildStatus?.conditions || [];
  const readyCondition = conditions.find((c) => c.type === ImageBuildConditionType.ImageBuildConditionTypeReady);
  const { level, label, customIcon } = getImageBuildStatusInfo(readyCondition, t);

  return (
    <ImageBuildAndExportStatus
      level={level}
      label={label}
      message={readyCondition?.message}
      imageReference={buildStatus?.imageReference}
      customIcon={customIcon}
    />
  );
};

export const ImageExportStatusDisplay = ({ imageStatus, imageReference }: ImageExportStatusProps) => {
  const { t } = useTranslation();

  const conditions = imageStatus?.conditions || [];
  const readyCondition = conditions.find((c) => c.type === ImageExportConditionType.ImageExportConditionTypeReady);
  const { level, label, customIcon } = getImageExportStatusInfo(readyCondition, t);

  return (
    <ImageBuildAndExportStatus
      level={level}
      label={label}
      message={readyCondition?.message}
      imageReference={imageReference}
      customIcon={customIcon}
    />
  );
};
