import * as React from 'react';

import { ImagePromotion } from '@flightctl/types/imagebuilder';
import { useTranslation } from '../../hooks/useTranslation';
import { StatusDisplayContent } from '../Status/StatusDisplay';
import { getImagePromotionStatus } from '../../utils/status/imagePromotion';

const ImagePromotionStatus = ({ promotion }: { promotion: ImagePromotion }) => {
  const { t } = useTranslation();
  const status = getImagePromotionStatus(promotion, t);
  return <StatusDisplayContent {...status} />;
};

export default ImagePromotionStatus;
