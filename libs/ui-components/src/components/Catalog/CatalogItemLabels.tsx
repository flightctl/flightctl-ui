import * as React from 'react';

import type { CatalogItem } from '@flightctl/types/alpha';
import type { CatalogItemRefSpec } from '@flightctl/types';

import { formatCatalogItemRef, getCatalogItemLabel } from '../../utils/catalog';
import TruncatedText from '../common/TruncatedText';

export const CatalogItemLabel = ({ item, shortened }: { item: CatalogItem; shortened?: boolean }) => (
  <TruncatedText text={getCatalogItemLabel(item)} maxChars={shortened ? 30 : undefined} />
);

export const CatalogItemRefLabel = ({ catalogItemRef }: { catalogItemRef: CatalogItemRefSpec }) => {
  const { version, catalog, item } = catalogItemRef;
  const text = version ? formatCatalogItemRef(catalogItemRef) : `${catalog}/${item}`;
  return <TruncatedText text={text} maxChars={50} leadingChars={16} />;
};
