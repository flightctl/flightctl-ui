import * as React from 'react';
import { Flex, FlexItem, Label } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import LabelWithHelperText from '../../common/WithHelperText';

const SystemInfoReportingBadge = ({ hasErrors }: { hasErrors: boolean }) => {
  const { t } = useTranslation();

  const label = hasErrors ? t('Reporting issue') : t('Reporting current');
  const content = hasErrors
    ? t('One or more values are stale.')
    : t('Periodic collection is active and the reported values are current.');

  return (
    <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>
        <Label status={hasErrors ? 'warning' : 'success'}>{label}</Label>
      </FlexItem>
      <FlexItem>
        <LabelWithHelperText hideLabel label={label} content={content} />
      </FlexItem>
    </Flex>
  );
};

export default SystemInfoReportingBadge;
