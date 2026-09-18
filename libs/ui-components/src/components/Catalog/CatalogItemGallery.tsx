import * as React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  Gallery,
  GalleryItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Truncate,
} from '@patternfly/react-core';

import { type CatalogItem } from '@flightctl/types/alpha';
import { useTranslation } from '../../hooks/useTranslation';
import CatalogItemIcon from './CatalogItemIcon';
import { CatalogItemDeprecationBadge, CatalogItemTypeBadge } from './CatalogItemBadges';

import './CatalogItemGallery.css';

const CatalogItemCard = ({ catalogItem, onSelect }: { catalogItem: CatalogItem; onSelect: VoidFunction }) => {
  const { t } = useTranslation();

  const { spec, metadata } = catalogItem;
  const fullTitle = spec.displayName || metadata.name || '';
  const shortDescription = spec.shortDescription || '';
  const provider = spec.provider;

  return (
    <Card
      isCompact
      isClickable
      className={`fctl-catalog-item-card${provider ? ' fctl-catalog-item-card--reduced' : ''}`}
    >
      <CardHeader
        selectableActions={{
          onClickAction: onSelect,
          onChange: onSelect,
          selectableActionAriaLabel: t('Select {{ name }}', {
            name: fullTitle,
          }),
        }}
      >
        <Split hasGutter>
          <SplitItem isFilled>
            <CatalogItemIcon catalogItem={catalogItem} size="xs" />
          </SplitItem>
          <SplitItem>
            <Flex gap={{ default: 'gapXs' }}>
              <FlexItem>
                <CatalogItemTypeBadge itemSpec={spec} />
              </FlexItem>
              {spec.deprecation && (
                <FlexItem>
                  <CatalogItemDeprecationBadge mode="item" />
                </FlexItem>
              )}
            </Flex>
          </SplitItem>
        </Split>
      </CardHeader>
      <CardBody>
        <Stack>
          <StackItem className="fctl-catalog-item-card__title">
            <Truncate content={fullTitle} position="middle" />
          </StackItem>
          {provider && (
            <StackItem className="fctl-catalog-item-card__provider">
              {t('Provided by {{provider}}', { provider })}
            </StackItem>
          )}
          {shortDescription && (
            <StackItem className="fctl-catalog-item-card__description">{shortDescription}</StackItem>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

const CatalogItemGallery = ({
  catalogItems,
  onSelect,
}: {
  catalogItems: CatalogItem[];
  onSelect: (item: CatalogItem) => void;
}) => {
  return (
    <Gallery hasGutter minWidths={{ default: '220px' }}>
      {catalogItems.map((item) => (
        <GalleryItem key={`${item.metadata.catalog}/${item.metadata.name}`}>
          <CatalogItemCard catalogItem={item} onSelect={() => onSelect(item)} />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default CatalogItemGallery;
