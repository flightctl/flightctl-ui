import * as React from 'react';
import {
  ClipboardCopy,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import type { ApplicationVolumeStatus } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';

type ApplicationVolumesDescriptionListProps = {
  volumes: ApplicationVolumeStatus[];
};

const ApplicationVolumesDescriptionList = ({ volumes }: ApplicationVolumesDescriptionListProps) => {
  const { t } = useTranslation();

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Volumes')}</DescriptionListTerm>
      <DescriptionListDescription>
        <DescriptionList
          isHorizontal
          horizontalTermWidthModifier={{ default: '15ch' }}
          className="fctl-applications-table__description-list"
        >
          {volumes.map((volume) => (
            <DescriptionListGroup key={volume.name}>
              <DescriptionListTerm>{volume.name}</DescriptionListTerm>
              <DescriptionListDescription>
                <ClipboardCopy isReadOnly hoverTip={t('Copy')} clickTip={t('Copied')} variant="inline-compact">
                  {volume.reference}
                </ClipboardCopy>
              </DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default ApplicationVolumesDescriptionList;
