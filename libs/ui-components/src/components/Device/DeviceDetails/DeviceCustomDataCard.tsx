import * as React from 'react';
import { CardBody, DescriptionList } from '@patternfly/react-core';
import { TagIcon } from '@patternfly/react-icons/dist/js/icons/tag-icon';

import type { CustomInfoListResult } from '../../../hooks/useDeviceSystemInfo';
import { useTranslation } from '../../../hooks/useTranslation';
import DetailsPageCard, { DetailsPageCardTitle, deviceCardIds } from '../../DetailsPage/DetailsPageCard';
import SystemInfoDescriptionGroup from './SystemInfoDescriptionGroup';
import SystemInfoReportingBadge from './SystemInfoReportingBadge';

const DeviceCustomDataCard = ({ customInfoResult }: { customInfoResult: CustomInfoListResult }) => {
  const { t } = useTranslation();

  return (
    <DetailsPageCard id={deviceCardIds.customInfo}>
      <DetailsPageCardTitle
        title={t('Custom data')}
        icon={<TagIcon />}
        badge={<SystemInfoReportingBadge hasErrors={customInfoResult.hasErrors} />}
      />
      <CardBody>
        <DescriptionList isHorizontal isCompact horizontalTermWidthModifier={{ default: '12ch' }}>
          {customInfoResult.entries.map((entry) => (
            <SystemInfoDescriptionGroup key={entry.key} entry={entry} />
          ))}
        </DescriptionList>
      </CardBody>
    </DetailsPageCard>
  );
};

export default DeviceCustomDataCard;
