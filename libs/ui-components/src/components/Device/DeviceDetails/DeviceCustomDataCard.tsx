import * as React from 'react';
import {
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import TagIcon from '@patternfly/react-icons/dist/js/icons/tag-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import DetailsPageCard, { DetailsPageCardTitle } from '../../DetailsPage/DetailsPageCard';

import './DeviceDetailsTab.css';

const DeviceCustomDataCard = ({ customInfo }: { customInfo: [string, string][] }) => {
  const { t } = useTranslation();

  return (
    <DetailsPageCard>
      <DetailsPageCardTitle title={t('Custom data')} icon={<TagIcon />} />
      <CardBody>
        <DescriptionList isHorizontal isCompact horizontalTermWidthModifier={{ default: '12ch' }}>
          {customInfo.map((entry, index) => (
            <DescriptionListGroup key={index}>
              <DescriptionListTerm>{entry[0]}</DescriptionListTerm>
              <DescriptionListDescription>{entry[1]}</DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      </CardBody>
    </DetailsPageCard>
  );
};

export default DeviceCustomDataCard;
