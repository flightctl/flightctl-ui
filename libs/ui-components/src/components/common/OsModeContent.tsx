import * as React from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { OsImageIcon } from '@patternfly/react-icons/dist/js/icons/os-image-icon';
import { ArchiveIcon } from '@patternfly/react-icons/dist/js/icons/archive-icon';

import { OsModeType } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';

const OsModeContent = ({ osMode }: { osMode: OsModeType | undefined }) => {
  const { t } = useTranslation();

  let content: string;
  let icon: React.ReactNode;
  if (osMode === OsModeType.OsModeImage) {
    content = t('Image mode: OS may be managed via bootable container images through Edge Manager');
    icon = <OsImageIcon />;
  } else if (osMode === OsModeType.OsModePackage) {
    content = t('Package mode: OS managed outside of Edge Manager');
    icon = <ArchiveIcon />;
  } else {
    content = t('OS mode: Not reported');
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

export default OsModeContent;
