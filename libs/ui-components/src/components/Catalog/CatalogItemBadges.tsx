import * as React from 'react';
import { Button, Flex, FlexItem, Icon, Label } from '@patternfly/react-core';
import { ArrowCircleUpIcon } from '@patternfly/react-icons/dist/js/icons/arrow-circle-up-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { CatalogItemCategory, type CatalogItemSpec } from '@flightctl/types/alpha';
import { useTranslation } from '../../hooks/useTranslation';
import WithTooltip from '../common/WithTooltip';
import { allCatalogTypeOptions } from '../../utils/catalogTypes';

export const CatalogItemTypeBadge = ({
  itemSpec,
  isCompact = true,
}: {
  itemSpec: CatalogItemSpec;
  isCompact?: boolean;
}) => {
  const { t } = useTranslation();
  const typeOptions = allCatalogTypeOptions(t);
  return (
    <Label
      variant="filled"
      isCompact={isCompact}
      color={itemSpec.category === CatalogItemCategory.CatalogItemCategorySystem ? 'teal' : 'purple'}
    >
      {typeOptions[itemSpec.type] || t('Unknown')}
    </Label>
  );
};

export const CatalogItemDeprecationBadge = ({ mode }: { mode: 'item' | 'version' }) => {
  const { t } = useTranslation();
  const text = mode === 'item' ? t('This item is deprecated') : t('This version is deprecated');
  return (
    <WithTooltip showTooltip content={text}>
      <span tabIndex={0} aria-label={text} role="img">
        <Icon status="warning" size="sm">
          <ExclamationTriangleIcon />
        </Icon>
      </span>
    </WithTooltip>
  );
};

export const CatalogItemUpdateBadge = ({ hasUpdates, onUpdate }: { hasUpdates: boolean; onUpdate?: VoidFunction }) => {
  const { t } = useTranslation();
  if (!hasUpdates) {
    return null;
  }
  if (onUpdate) {
    return (
      <Button variant="secondary" isInline onClick={onUpdate} icon={<ArrowCircleUpIcon />}>
        {t('Update available')}
      </Button>
    );
  }

  return (
    <WithTooltip
      showTooltip
      content={t(
        'A newer catalog version is available. Update this item from the Software Catalog tab on this fleet or device.',
      )}
    >
      <span tabIndex={0}>
        <Label isCompact variant="outline" color="blue" icon={<ArrowCircleUpIcon />}>
          {t('Update available')}
        </Label>
      </span>
    </WithTooltip>
  );
};

const CatalogItemViewBadges = ({
  itemSpec,
  hasUpdates,
}: {
  itemSpec: CatalogItemSpec | undefined;
  hasUpdates: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
      <FlexItem>
        <Label isCompact variant="outline">
          {t('Software Catalog')}
        </Label>
      </FlexItem>
      {itemSpec ? (
        <FlexItem>
          <CatalogItemTypeBadge itemSpec={itemSpec} />
        </FlexItem>
      ) : (
        <FlexItem>
          <Label isCompact variant="outline" color="blue">
            {t('Loading')}
          </Label>
        </FlexItem>
      )}
      {hasUpdates && (
        <FlexItem>
          <CatalogItemUpdateBadge hasUpdates={hasUpdates} />
        </FlexItem>
      )}
      {itemSpec?.deprecation && (
        <FlexItem>
          <CatalogItemDeprecationBadge mode="item" />
        </FlexItem>
      )}
    </Flex>
  );
};

export default CatalogItemViewBadges;
