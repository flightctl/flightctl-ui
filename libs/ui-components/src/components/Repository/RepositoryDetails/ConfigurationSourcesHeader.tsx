import * as React from 'react';
import { Badge, Flex, FlexItem, Title } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';

type ConfigurationSourcesHeaderProps = {
  count: number;
  className?: string;
};

const ConfigurationSourcesHeader = ({ count, className }: ConfigurationSourcesHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} className={className}>
      <FlexItem>
        <Title headingLevel="h4" size="md" className="pf-v6-u-m-0">
          {t('Sources')}
        </Title>
      </FlexItem>
      <FlexItem>
        <Badge isRead screenReaderText={t('Number of configurations')}>
          {count}
        </Badge>
      </FlexItem>
    </Flex>
  );
};

export default ConfigurationSourcesHeader;
