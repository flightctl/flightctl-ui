import * as React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  Spinner,
} from '@patternfly/react-core';
import type { CatalogItemRefSpec } from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import { getCatalogRefDisplayName, getUpdates } from '../../utils/catalog';
import { useResolvedCatalogRef } from '../Catalog/useResolvedCatalogRef';
import CatalogRefDescriptionGroups from './CatalogRefDescriptionGroups';
import { CatalogItemTypeBadge } from '../Catalog/CatalogItemBadges';

type CatalogRefReviewDetailsProps = {
  catalogItemRef: CatalogItemRefSpec;
  name?: string;
  showUpdateStatus?: boolean;
};

const CatalogRefReviewDetails = ({ catalogItemRef, name, showUpdateStatus }: CatalogRefReviewDetailsProps) => {
  const { t } = useTranslation();
  const resolved = useResolvedCatalogRef(catalogItemRef);
  const item = resolved?.item;
  const isLoading = resolved?.isLoading;
  const channel = catalogItemRef.channel || resolved?.channel || '';
  const imageUri = resolved?.imageUri;
  const displayName = name || getCatalogRefDisplayName(catalogItemRef, item);

  const hasUpdates =
    showUpdateStatus &&
    item &&
    resolved?.version &&
    channel &&
    getUpdates(item, channel, resolved.version.version).length > 0;

  if (isLoading) {
    return <Spinner size="sm" />;
  }

  return (
    <DescriptionList isHorizontal isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
        <DescriptionListDescription>{displayName}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Source')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Label isCompact variant="outline">
            {t('Software Catalog')}
          </Label>
        </DescriptionListDescription>
      </DescriptionListGroup>
      {item && (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
          <DescriptionListDescription>
            <CatalogItemTypeBadge itemSpec={item.spec} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      <CatalogRefDescriptionGroups catalogItemRef={catalogItemRef} channel={channel} imageUri={imageUri} item={item} />
      {hasUpdates && (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Updates')}</DescriptionListTerm>
          <DescriptionListDescription>
            <Label isCompact variant="outline" color="blue">
              {t('Update available')}
            </Label>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};

export default CatalogRefReviewDetails;
