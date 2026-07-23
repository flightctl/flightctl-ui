import * as React from 'react';

import { Flex, FlexItem, Icon, Label, Tooltip } from '@patternfly/react-core';
import { OsImageIcon } from '@patternfly/react-icons/dist/js/icons/os-image-icon';
import { ArchiveIcon } from '@patternfly/react-icons/dist/js/icons/archive-icon';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

import { type DevicesSummaryCapabilities, OsModeType } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';

const OS_MODE_UNREPORTED = 'unknown';

const FleetDetailsOsMode = ({ osModeCounts }: { osModeCounts: DevicesSummaryCapabilities['osMode'] }) => {
  const { t } = useTranslation();

  const imageCount = osModeCounts?.[OsModeType.OsModeImage] || 0;
  const packageCount = osModeCounts?.[OsModeType.OsModePackage] || 0;
  const unreportedCount = osModeCounts?.[OS_MODE_UNREPORTED] || 0;

  if (imageCount + packageCount + unreportedCount === 0) {
    return null;
  }

  return (
    <Flex spaceItems={{ default: 'spaceItemsSm' }}>
      {imageCount > 0 && packageCount > 0 && (
        <FlexItem>
          <Label variant="outline" isCompact color="yellow">
            {t('Mixed')}
          </Label>
        </FlexItem>
      )}
      {imageCount > 0 && (
        <FlexItem>
          <Tooltip content={t('Image mode: OS may be managed via bootable container images through Edge Manager')}>
            <Label
              variant="outline"
              isCompact
              icon={
                <Icon size="sm">
                  <OsImageIcon />
                </Icon>
              }
            >
              {t('Image ({{ imageCount }})', { imageCount })}
            </Label>
          </Tooltip>
        </FlexItem>
      )}
      {packageCount > 0 && (
        <FlexItem>
          <Tooltip content={t('Package mode: OS managed outside of Edge Manager')}>
            <Label
              variant="outline"
              isCompact
              icon={
                <Icon size="sm">
                  <ArchiveIcon />
                </Icon>
              }
            >
              {t('Package ({{ packageCount }})', { packageCount })}
            </Label>
          </Tooltip>
        </FlexItem>
      )}
      {unreportedCount > 0 && (
        <FlexItem>
          <Tooltip content={t('OS mode: Not reported')}>
            <Label
              variant="outline"
              isCompact
              icon={
                <Icon size="sm">
                  <OutlinedQuestionCircleIcon />
                </Icon>
              }
            >
              {t('Not reported ({{ unreportedCount }})', { unreportedCount })}
            </Label>
          </Tooltip>
        </FlexItem>
      )}
    </Flex>
  );
};

export default FleetDetailsOsMode;
