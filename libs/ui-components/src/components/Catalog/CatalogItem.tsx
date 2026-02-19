import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Content,
  ContentVariants,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import * as React from 'react';
import { CatalogItem } from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';
import { getCatalogItemIcon, getCatalogItemTitles } from './utils';

export type CatalogItemProps = {
  catalogItem: CatalogItem;
  onSelect: VoidFunction;
};

const CatalogItem: React.FC<CatalogItemProps> = ({ catalogItem, onSelect }) => {
  const { t } = useTranslation();
  return (
    <Card isCompact isClickable>
      <CardHeader
        selectableActions={{
          onClickAction: onSelect,
          onChange: onSelect,
        }}
      >
        <Split>
          <SplitItem isFilled>
            <img
              src={getCatalogItemIcon(catalogItem)}
              alt={`${catalogItem.metadata.name} icon`}
              style={{ maxWidth: '60px' }}
            />
          </SplitItem>
          <SplitItem>
            <Badge isRead>{getCatalogItemTitles(catalogItem.spec.category, t)}</Badge>
          </SplitItem>
        </Split>
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Stack>
              <StackItem>
                <Title headingLevel="h3">{catalogItem.spec.displayName || catalogItem.metadata.name}</Title>
              </StackItem>
              {catalogItem.spec.provider && (
                <StackItem>
                  <Content component={ContentVariants.small}>
                    {t('Provided by {{provider}}', { provider: catalogItem.spec.provider })}
                  </Content>
                </StackItem>
              )}
            </Stack>
          </StackItem>
          {catalogItem.spec.shortDescription && <StackItem>{catalogItem.spec.shortDescription}</StackItem>}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default CatalogItem;
