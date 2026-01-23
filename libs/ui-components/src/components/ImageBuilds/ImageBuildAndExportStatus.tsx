import * as React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { TFunction } from 'react-i18next';

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
};

const getImageBuildStatusInfo = (condition: ImageBuildCondition | undefined, t: TFunction): LevelAndLabel => {
  // Without the Ready condition, the build wouldn't be even queued for processing.
  if (!condition) {
    return { level: 'unknown', label: t('Unknown') };
  }

  switch (condition.reason) {
    case ImageBuildConditionReason.ImageBuildConditionReasonPending:
      return { level: 'unknown', label: t('Queued') };
    case ImageBuildConditionReason.ImageBuildConditionReasonBuilding:
      return { level: 'info', label: t('Building') };
    case ImageBuildConditionReason.ImageBuildConditionReasonPushing:
      return { level: 'info', label: t('Pushing') };
    case ImageBuildConditionReason.ImageBuildConditionReasonCompleted:
      return { level: 'success', label: t('Complete') };
    case ImageBuildConditionReason.ImageBuildConditionReasonFailed:
      return { level: 'danger', label: t('Failed') };
    default:
      return { level: 'unknown', label: t('Unknown') };
  }
};

const getImageExportStatusInfo = (condition: ImageExportCondition | undefined, t: TFunction): LevelAndLabel => {
  const reason = condition?.reason;
  switch (reason) {
    case ImageExportConditionReason.ImageExportConditionReasonPending:
      // ImageExports will have a "pending" state while their associated imageBuild is incomplete.
      return { level: 'unknown', label: t('Queued') };
    case ImageExportConditionReason.ImageExportConditionReasonConverting:
      // Main status while the export image is being generated
      return { level: 'info', label: t('Converting') };
    case ImageExportConditionReason.ImageExportConditionReasonPushing:
      return { level: 'info', label: t('Pushing') };
    case ImageExportConditionReason.ImageExportConditionReasonCompleted:
      return { level: 'success', label: t('Complete') };
    case ImageExportConditionReason.ImageExportConditionReasonFailed:
      return { level: 'danger', label: t('Failed') };
    default:
      return { level: 'unknown', label: t('Unknown') };
  }
};

const ImageBuildAndExportStatus = ({
  level,
  label,
  message,
  imageReference,
}: {
  level: StatusLevel;
  label: string;
  message: React.ReactNode | undefined;
  imageReference: string | undefined;
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

  return <StatusDisplayContent label={label} level={level} message={message} />;
};

export const ImageBuildStatusDisplay = ({ buildStatus }: ImageBuildStatusProps) => {
  const { t } = useTranslation();

  const conditions = buildStatus?.conditions || [];
  const readyCondition = conditions.find((c) => c.type === ImageBuildConditionType.ImageBuildConditionTypeReady);
  const { level, label } = getImageBuildStatusInfo(readyCondition, t);

  return (
    <ImageBuildAndExportStatus
      level={level}
      label={label}
      message={readyCondition?.message}
      imageReference={buildStatus?.imageReference}
    />
  );
};

export const ImageExportStatusDisplay = ({ imageStatus, imageReference }: ImageExportStatusProps) => {
  const { t } = useTranslation();

  const conditions = imageStatus?.conditions || [];
  const readyCondition = conditions.find((c) => c.type === ImageExportConditionType.ImageExportConditionTypeReady);
  const { level, label } = getImageExportStatusInfo(readyCondition, t);

  return (
    <ImageBuildAndExportStatus
      level={level}
      label={label}
      message={readyCondition?.message}
      imageReference={imageReference}
    />
  );
};
