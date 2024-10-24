import * as React from 'react';
import {
  Bullseye,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import { DeviceIntegrityStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import IntegrityStatus from '../../Status/IntegrityStatus';
import FlightControlDescriptionList from '../../common/FlightCtlDescriptionList';

type IntegrityDetailsProps = {
  integrity?: DeviceIntegrityStatus;
};

const IntegrityDetails = ({ integrity }: IntegrityDetailsProps) => {
  const { t } = useTranslation();
  const info = integrity?.summary.info;
  const status = integrity?.summary.status;
  return info || status ? (
    <FlightControlDescriptionList columnModifier={{ lg: '3Col' }}>
      {status && (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
          <DescriptionListDescription>
            <IntegrityStatus status={status} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {info && (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Details')}</DescriptionListTerm>
          <DescriptionListDescription>{info}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </FlightControlDescriptionList>
  ) : (
    <Bullseye>{t('No system integrity details found.')}</Bullseye>
  );
};

export default IntegrityDetails;
