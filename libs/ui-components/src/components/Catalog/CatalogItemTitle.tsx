import * as React from 'react';
import { Alert, Content, ContentVariants, Flex, FlexItem, Icon, Stack, StackItem, Title } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import type { TFunction } from 'i18next';

import type { CatalogItemRefSpec } from '@flightctl/types';
import type { CatalogItem } from '@flightctl/types/alpha';
import { useTranslation } from '../../hooks/useTranslation';
import CatalogItemIcon from './CatalogItemIcon';
import { CatalogItemLabel } from './CatalogItemDetails';

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
  title: React.ReactNode;
  description?: React.ReactNode;
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
              <Content component={ContentVariants.small}>{description}</Content>
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
  headerTitle,
}: {
  catalogRef: CatalogItemRefSpec;
  headerTitle: string;
}) => {
  const { t } = useTranslation();
  return (
    <CatalogTitleLayout
      icon={
        <Icon size="xl">
          <OutlinedQuestionCircleIcon />
        </Icon>
      }
      title={headerTitle}
      description={
        <Stack>
          <StackItem>
            <Alert
              isInline
              isPlain
              variant="danger"
              title={t(
                'The catalog item referenced by this element could not be found. Review that the details are correct and the catalog item has not been deleted.',
              )}
            />
          </StackItem>
          <StackItem>{`${catalogRef.catalog}/${catalogRef.item}`}</StackItem>
        </Stack>
      }
      version={catalogRef.version}
      channel={catalogRef.channel}
    />
  );
};

const CatalogItemTitle = ({
  item,
  title,
  version,
  channel,
}: {
  item: CatalogItem;
  title?: string;
  version?: string;
  channel?: string;
}) => {
  const nameEl = <CatalogItemLabel item={item} shortened />;
  return (
    <CatalogTitleLayout
      icon={<CatalogItemIcon catalogItem={item} />}
      title={title || nameEl}
      description={title ? nameEl : undefined}
      version={version}
      channel={channel}
    />
  );
};

export default CatalogItemTitle;
