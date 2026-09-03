import * as React from 'react';
import { Icon, Label, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { OsImageIcon } from '@patternfly/react-icons/dist/js/icons/os-image-icon';
import { ArchiveIcon } from '@patternfly/react-icons/dist/js/icons/archive-icon';

import { OsModeType } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';

export const OsModeLabel = ({ osMode }: { osMode: OsModeType | undefined }) => {
  const { t } = useTranslation();

  if (!osMode) {
    return '-';
  }

  const isImageMode = osMode === OsModeType.OsModeImage;

  return (
    <Label variant="outline" isCompact icon={isImageMode ? <OsImageIcon /> : <ArchiveIcon />}>
      {isImageMode ? t('Image') : t('Package')}
    </Label>
  );
};

const OsModeIcon = ({ osMode }: { osMode: OsModeType | undefined }) => {
  const { t } = useTranslation();

  let content: string;
  let icon: React.ReactNode;
  if (osMode === OsModeType.OsModeImage) {
    content = t('Image mode: OS uses bootable container images');
    icon = <OsImageIcon />;
  } else if (osMode === OsModeType.OsModePackage) {
    content = t('Package mode: OS managed outside of Edge Manager');
    icon = <ArchiveIcon />;
  } else {
    content = t('OS mode: Unknown');
    icon = <OutlinedQuestionCircleIcon />;
  }

  return (
    <Tooltip content={content}>
      <Icon size="sm" aria-label={content}>
        {icon}
      </Icon>
    </Tooltip>
  );
};

export default OsModeIcon;
