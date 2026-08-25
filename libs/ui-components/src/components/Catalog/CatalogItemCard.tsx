import {
  Card,
  CardBody,
  CardHeader,
  Content,
  ContentVariants,
  Label,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import * as React from 'react';
import { type CatalogItem, CatalogItemCategory } from '@flightctl/types/alpha';

import { useTranslation } from '../../hooks/useTranslation';
import { getCatalogItemBadge, getCatalogItemIcon, getCatalogItemLabel } from '../../utils/catalog';
import { CatalogItemLabel } from './CatalogItemLabels';

export type CatalogItemCardProps = {
  catalogItem: CatalogItem;
  onSelect: VoidFunction;
};

const CatalogItemCard: React.FC<CatalogItemCardProps> = ({ catalogItem, onSelect }) => {
  const { t } = useTranslation();
  return (
    <Card isCompact isClickable>
      <CardHeader
        selectableActions={{
          onClickAction: onSelect,
          onChange: onSelect,
          selectableActionAriaLabel: t('Select {{ name }}', {
            name: getCatalogItemLabel(catalogItem),
          }),
        }}
      >
        <Split>
          <SplitItem isFilled>
            <img
              src={getCatalogItemIcon(catalogItem)}
              alt={`${catalogItem.metadata.name} icon`}
              style={{ maxWidth: '40px' }}
            />
          </SplitItem>
          <SplitItem>
            <Label
              variant="filled"
              color={catalogItem.spec.category === CatalogItemCategory.CatalogItemCategorySystem ? 'teal' : 'purple'}
            >
              {getCatalogItemBadge(catalogItem.spec.type, t)}
            </Label>
          </SplitItem>
        </Split>
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Stack>
              <StackItem isFilled>
                <Title headingLevel="h3">
                  <CatalogItemLabel item={catalogItem} shortened />
                </Title>
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
          {catalogItem.spec.deprecation && (
            <StackItem>
              <Label variant="outline" status="warning">
                {t('Deprecated')}
              </Label>
            </StackItem>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default CatalogItemCard;
