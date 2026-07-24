import * as React from 'react';
import { ArrowCircleUpIcon } from '@patternfly/react-icons/dist/js/icons/arrow-circle-up-icon';
import { ActionsColumn } from '@patternfly/react-table';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  Divider,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Label,
  Popover,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { CubeIcon } from '@patternfly/react-icons/dist/js/icons/cube-icon';

import { DeviceSpec } from '@flightctl/types';
import { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';
import { getCatalogItemIcon, getUpdates } from '../../utils/catalog';
import { useTranslation } from '../../hooks/useTranslation';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import { buildAllDropdownActions } from '../common/ActionsDropdownList';
import { useSpecCatalogItems } from './useSpecCatalogItems';

type UpdateInfoProps = {
  catalogItem: CatalogItem;
  channel: string;
  itemVersion: CatalogItemVersion;
  onClick: VoidFunction;
  canEdit: boolean;
};

const UpdateInfo = ({ onClick, catalogItem, channel, itemVersion, canEdit }: UpdateInfoProps) => {
  const { t } = useTranslation();
  const updates = getUpdates(catalogItem, channel, itemVersion.version);

  if (!updates.length) {
    return false;
  }

  return canEdit ? (
    <Button variant="link" isInline onClick={onClick} icon={<ArrowCircleUpIcon />}>
      {t('Update available')}
    </Button>
  ) : (
    <Label variant="outline" color="blue">
      {t('Update available')}
    </Label>
  );
};

export const CatalogItemTitle = ({
  item,
  appName,
  version,
  channel,
}: {
  item: CatalogItem;
  appName?: string;
  version?: string;
  channel: string;
}) => {
  const { t } = useTranslation();
  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} alignContent={{ default: 'alignContentCenter' }}>
      <FlexItem>
        <img src={getCatalogItemIcon(item)} alt={`${item.metadata.name} icon`} style={{ maxWidth: '40px' }} />
      </FlexItem>
      <FlexItem>
        <Stack>
          <StackItem>
            <Title headingLevel="h3">{item.spec.displayName || item.metadata.name}</Title>
          </StackItem>
          {appName && (
            <StackItem>
              <Title headingLevel="h6">{appName}</Title>
            </StackItem>
          )}
          {version && (
            <StackItem>
              <Content component={ContentVariants.small}>
                {t('Version: {{version}}, Channel: {{channel}}', { version, channel })}
              </Content>
            </StackItem>
          )}
        </Stack>
      </FlexItem>
    </Flex>
  );
};

type InstalledSoftwareItemProps = {
  item: CatalogItem;
  version: CatalogItemVersion | undefined;
  channel: string;
  onEdit: VoidFunction;
  onDelete: VoidFunction;
  canEdit: boolean;
};

const InstalledSoftwareItem = ({ item, version, channel, onEdit, onDelete, canEdit }: InstalledSoftwareItemProps) => {
  const { t } = useTranslation();
  const actions = canEdit
    ? buildAllDropdownActions(
      [
        {
          title: t('Edit'),
          onClick: onEdit,
        },
      ],
      [
        {
          title: t('Delete'),
          onClick: onDelete,
        },
      ],
    )
    : [];

  const deprecationMessage = item.spec.deprecation?.message || version?.deprecation?.message;

  return (
    <StackItem key={item.metadata.name}>
      <Flex alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem grow={{ default: 'grow' }}>
          <CatalogItemTitle item={item} channel={channel} version={version?.version} />
        </FlexItem>
        {version && (
          <FlexItem>
            <UpdateInfo catalogItem={item} itemVersion={version} channel={channel} onClick={onEdit} canEdit={canEdit} />
          </FlexItem>
        )}
        {deprecationMessage && (
          <FlexItem>
            <Popover bodyContent={deprecationMessage} withFocusTrap triggerAction="click">
              <Label variant="outline" color="orange">
                {t('Deprecated')}
              </Label>
            </Popover>
          </FlexItem>
        )}
        {actions.length > 0 && (
          <FlexItem>
            <ActionsColumn items={actions} />
          </FlexItem>
        )}
      </Flex>
    </StackItem>
  );
};

type InstalledSoftwareProps = {
  hasPackageMode?: boolean;
  spec: DeviceSpec | undefined;
  onDeleteOs: () => Promise<void>;
  onDeleteApp: (appName: string) => Promise<void>;
  onEdit: (catalogId: string, catalogItemId: string, appName?: string) => void;
  canEdit: boolean;
};

const InstalledSoftware = ({
  spec,
  onDeleteOs,
  onDeleteApp,
  onEdit,
  canEdit,
  hasPackageMode,
}: InstalledSoftwareProps) => {
  const { t } = useTranslation();
  const [deleteOs, setDeleteOs] = React.useState(false);
  const [appToDelete, setAppToDelete] = React.useState<string>();
  const { os, apps, isLoading } = useSpecCatalogItems(spec);

  if (isLoading) {
    return <EmptyState titleText={t('Loading installed software')} headingLevel="h4" icon={Spinner} />;
  }

  const hasOs = !!os?.item;
  const hasApps = apps.length > 0;
  const isEmpty = !hasOs && !hasApps;

  return (
    <>
      <Card>
        <CardTitle>{t('Deployed Software')}</CardTitle>
        <CardBody>
          {isEmpty ? (
            <EmptyState headingLevel="h4" icon={CubeIcon} titleText={t('No software deployed')}>
              <EmptyStateBody>
                {hasPackageMode
                  ? t('Select an application from the catalog below.')
                  : t('Select an operating system or application from the catalog below.')}
              </EmptyStateBody>
            </EmptyState>
          ) : (
            <Stack hasGutter>
              {hasOs && (
                <InstalledSoftwareItem
                  item={os.item}
                  version={os.version}
                  channel={os.channel}
                  onEdit={() => onEdit(os.item.metadata.catalog, os.item.metadata.name || '')}
                  onDelete={() => setDeleteOs(true)}
                  canEdit={canEdit}
                />
              )}
              {apps.map((app, index) => (
                <React.Fragment key={app.name}>
                  {(hasOs || index > 0) && <Divider />}
                  <InstalledSoftwareItem
                    item={app.item}
                    version={app.version}
                    channel={app.channel}
                    onEdit={() => onEdit(app.item.metadata.catalog, app.item.metadata.name || '', app.name)}
                    onDelete={() => setAppToDelete(app.name)}
                    canEdit={canEdit}
                  />
                </React.Fragment>
              ))}
            </Stack>
          )}
        </CardBody>
      </Card>
      {deleteOs && os && (
        <DeleteModal
          onClose={() => setDeleteOs(false)}
          onDelete={async () => {
            await onDeleteOs();
            setDeleteOs(false);
          }}
          resourceName={os.item.spec.displayName || os.item.metadata.name || ''}
          resourceType={t('operating system')}
        />
      )}
      {appToDelete && (
        <DeleteModal
          onClose={() => setAppToDelete(undefined)}
          onDelete={async () => {
            await onDeleteApp(appToDelete);
            setAppToDelete(undefined);
          }}
          resourceName={appToDelete}
          resourceType={t('application')}
        />
      )}
    </>
  );
};

export default InstalledSoftware;
