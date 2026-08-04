import React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Icon,
  Popover,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import type { TFunction } from 'i18next';

import type { CatalogItemRefSpec } from '@flightctl/types';
import type { CatalogItem } from '@flightctl/types/alpha';
import { useTranslation } from '../../hooks/useTranslation';
import { getCatalogItemIcon } from '../../utils/catalog';

const formatVersionLine = (t: TFunction, version?: string, channel?: string) => {
  if (!version) {
    return undefined;
  }
  return channel
    ? t('Version: {{ version }}, Channel: {{ channel }}', { version, channel })
    : t('Version: {{ version }}', { version });
};

type CatalogTitleLayoutProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  version?: string;
  channel?: string;
};

const CatalogTitleLayout = ({ icon, title, description, version, channel }: CatalogTitleLayoutProps) => {
  const { t } = useTranslation();
  const versionLine = formatVersionLine(t, version, channel);
  return (
    <Flex alignItems={{ default: 'alignItemsFlexStart' }}>
      <FlexItem>{icon}</FlexItem>
      <FlexItem>
        <Stack>
          <StackItem>
            <Title headingLevel="h3">{title}</Title>
          </StackItem>
          {description && (
            <StackItem>
              <Title headingLevel="h6">{description}</Title>
            </StackItem>
          )}
          {versionLine && (
            <StackItem>
              <Content component={ContentVariants.small}>{versionLine}</Content>
            </StackItem>
          )}
        </Stack>
      </FlexItem>
    </Flex>
  );
};

export const BrokenCatalogItemTitle = ({
  catalogRef,
  description,
}: {
  catalogRef: CatalogItemRefSpec;
  description?: string;
}) => {
  const { t } = useTranslation();
  return (
    <CatalogTitleLayout
      icon={
        <Popover
          aria-label={t('Invalid reference to a catalog item')}
          alertSeverityVariant="danger"
          headerContent={t('Invalid reference to a catalog item')}
          bodyContent={t(
            'The catalog item referenced by this element could not be found. Review that the details are correct and the catalog item has not been deleted.',
          )}
          withFocusTrap
          triggerAction="click"
        >
          <Button
            variant="plain"
            isInline
            aria-label={t('Catalog item not found')}
            icon={
              <Icon status="danger">
                <ExclamationCircleIcon />
              </Icon>
            }
          />
        </Popover>
      }
      title={`${catalogRef.catalog}/${catalogRef.item}`}
      description={description}
      version={catalogRef.version}
      channel={catalogRef.channel}
    />
  );
};

const CatalogItemTitle = ({
  item,
  description,
  version,
  channel,
}: {
  item: CatalogItem;
  description?: string;
  version?: string;
  channel?: string;
}) => (
  <CatalogTitleLayout
    icon={<img src={getCatalogItemIcon(item)} alt={`${item.metadata.name} icon`} style={{ maxWidth: '40px' }} />}
    title={item.spec.displayName || item.metadata.name || ''}
    description={description}
    version={version}
    channel={channel}
  />
);

export default CatalogItemTitle;
