import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  Content,
  ContentVariants,
  Divider,
  Flex,
  FlexItem,
  Icon,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';
import AngleDownIcon from '@patternfly/react-icons/dist/js/icons/angle-down-icon';
import AngleRightIcon from '@patternfly/react-icons/dist/js/icons/angle-right-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import type { CatalogItemRefSpec } from '@flightctl/types';
import type { CatalogItem } from '@flightctl/types/alpha';
import { useTranslation } from '../../hooks/useTranslation';
import { getCatalogRefDisplayName, getUpdates } from '../../utils/catalog';
import type { CatalogAppForm } from '../../types/deviceSpec';
import WithTooltip from '../common/WithTooltip';
import { useResolvedCatalogRef } from '../Catalog/useResolvedCatalogRef';
import CatalogRefCardDetails from './CatalogRefCardDetails';
import CatalogItemIcon from '../Catalog/CatalogItemIcon';
import CatalogItemViewBadges, { CatalogItemDeprecationBadge } from '../Catalog/CatalogItemBadges';

import './CatalogRefCard.css';

type CatalogRefCardProps = {
  catalogItemRef: CatalogItemRefSpec;
  headerTitle?: string;
  isCompact?: boolean;
  showUpdateStatus: boolean;
  onEdit?: VoidFunction;
  formikError?: CatalogAppForm;
};

const CatalogRefTitle = ({
  item,
  title,
  isCompact,
  isLoading,
}: {
  item?: CatalogItem;
  title: string;
  isCompact: boolean;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const icon = item ? (
    <CatalogItemIcon catalogItem={item} size={isCompact ? 'xs' : 'sm'} />
  ) : isLoading ? (
    <Spinner size="md" />
  ) : null;

  const provider = item?.spec.provider;
  const subtitle = provider ? t('Provided by {{provider}}', { provider }) : undefined;

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
      {icon && <FlexItem>{icon}</FlexItem>}
      <FlexItem>
        <Stack>
          <StackItem className="pf-v6-u-font-weight-bold">{title}</StackItem>
          {subtitle && (
            <StackItem>
              <Content component={ContentVariants.small}>{subtitle}</Content>
            </StackItem>
          )}
        </Stack>
      </FlexItem>
    </Flex>
  );
};

const CatalogFormError = ({ error }: { error: CatalogAppForm | undefined }) => {
  const errorText = error?.name;

  if (!errorText) {
    return null;
  }
  return (
    <FlexItem>
      <WithTooltip showTooltip={true} content={errorText}>
        <span tabIndex={0} role="img" aria-label={errorText}>
          <Icon status="danger">
            <ExclamationCircleIcon />
          </Icon>
        </span>
      </WithTooltip>
    </FlexItem>
  );
};

const CatalogRefCard = ({
  catalogItemRef,
  headerTitle,
  showUpdateStatus,
  onEdit,
  formikError,
  isCompact = false,
}: CatalogRefCardProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const resolved = useResolvedCatalogRef(catalogItemRef);
  const item = resolved?.item;
  const isLoading = resolved?.isLoading;
  const version = resolved?.version;
  const channel = catalogItemRef.channel || resolved?.channel || '';
  const displayName = headerTitle || getCatalogRefDisplayName(catalogItemRef, item);

  const hasUpdates = Boolean(
    showUpdateStatus && item && version && channel && getUpdates(item, channel, version.version).length > 0,
  );

  const isDeprecated = version?.deprecation?.message;

  return (
    <Card isCompact className={`fctl-catalog-ref-card ${isCompact ? 'fctl-catalog-ref-card--compact' : ''}`}>
      <CardBody>
        <Stack hasGutter={isExpanded}>
          <StackItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              gap={{ default: 'gapMd' }}
            >
              <FlexItem grow={{ default: 'grow' }}>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                  <FlexItem>
                    <Button
                      variant="plain"
                      onClick={() => setIsExpanded((expanded) => !expanded)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? t('Collapse') : t('Expand')}
                    >
                      {isExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
                    </Button>
                  </FlexItem>
                  <CatalogFormError error={formikError} />
                  <FlexItem>
                    <CatalogRefTitle
                      item={item}
                      title={displayName}
                      isLoading={isLoading || false}
                      isCompact={isCompact}
                    />
                  </FlexItem>
                </Flex>
              </FlexItem>
              <FlexItem shrink={{ default: 'shrink' }}>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                  <CatalogItemViewBadges itemSpec={item?.spec} hasUpdates={hasUpdates} />
                  {isDeprecated && (
                    <FlexItem>
                      <CatalogItemDeprecationBadge mode="version" />
                    </FlexItem>
                  )}
                  {onEdit && (
                    <FlexItem>
                      <Button variant="plain" icon={<PencilAltIcon />} onClick={onEdit} aria-label={t('Edit')} />
                    </FlexItem>
                  )}
                </Flex>
              </FlexItem>
            </Flex>
          </StackItem>

          {isExpanded && !isLoading && (
            <>
              <StackItem>
                <Divider component="div" />
              </StackItem>
              <StackItem>
                <CatalogRefCardDetails catalogItemRef={catalogItemRef} resolvedRef={resolved} />
              </StackItem>
            </>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default CatalogRefCard;
