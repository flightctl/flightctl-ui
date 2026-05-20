import { TFunction } from 'i18next';

import {
  ImagePromotion,
  ImagePromotionConditionReason,
  ImagePromotionConditionType,
} from '@flightctl/types/imagebuilder';
import { StatusLevel } from './common';

export type ImagePromotionStatusReason = ImagePromotionConditionReason | 'Unknown';

export const getImagePromotionStatusLabel = (reason: ImagePromotionStatusReason, t: TFunction): string => {
  switch (reason) {
    case ImagePromotionConditionReason.ImagePromotionConditionReasonWaitingForArtifacts:
      return t('Waiting for artifacts');
    case ImagePromotionConditionReason.ImagePromotionConditionReasonPublishing:
      return t('Publishing');
    case ImagePromotionConditionReason.ImagePromotionConditionReasonCompleted:
      return t('Completed');
    case ImagePromotionConditionReason.ImagePromotionConditionReasonFailed:
      return t('Failed');
    case ImagePromotionConditionReason.ImagePromotionConditionReasonBuildFailed:
      return t('Build failed');
    case ImagePromotionConditionReason.ImagePromotionConditionReasonBuildCanceled:
      return t('Build canceled');
    case ImagePromotionConditionReason.ImagePromotionConditionReasonAmendmentFailed:
      return t('Amendment failed');
    default:
      return t('Unknown');
  }
};

export const getImagePromotionStatusLevel = (reason: ImagePromotionStatusReason): StatusLevel => {
  switch (reason) {
    case ImagePromotionConditionReason.ImagePromotionConditionReasonWaitingForArtifacts:
    case ImagePromotionConditionReason.ImagePromotionConditionReasonPublishing:
      return 'info';
    case ImagePromotionConditionReason.ImagePromotionConditionReasonCompleted:
      return 'success';
    case ImagePromotionConditionReason.ImagePromotionConditionReasonFailed:
    case ImagePromotionConditionReason.ImagePromotionConditionReasonBuildFailed:
    case ImagePromotionConditionReason.ImagePromotionConditionReasonAmendmentFailed:
      return 'danger';
    case ImagePromotionConditionReason.ImagePromotionConditionReasonBuildCanceled:
      return 'warning';
    default:
      return 'unknown';
  }
};

export const getImagePromotionStatus = (
  promotion: ImagePromotion,
  t: TFunction,
): { reason: ImagePromotionStatusReason; label: string; level: StatusLevel; message: string | undefined } => {
  const readyCondition = promotion.status?.conditions?.find(
    (c) => c.type === ImagePromotionConditionType.ImagePromotionConditionTypeReady,
  );
  const reason = (readyCondition?.reason as ImagePromotionConditionReason | undefined) ?? 'Unknown';
  return {
    reason,
    label: getImagePromotionStatusLabel(reason, t),
    level: getImagePromotionStatusLevel(reason),
    message: readyCondition?.message,
  };
};
