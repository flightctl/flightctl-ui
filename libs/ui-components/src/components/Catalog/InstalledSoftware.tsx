import { ContainerApplication, DeviceSpec } from '@flightctl/types';
import { ArrowCircleUpIcon } from '@patternfly/react-icons/dist/js/icons/arrow-circle-up-icon';
import { ActionsColumn, IAction } from '@patternfly/react-table';
import * as React from 'react';
import { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';
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

import { getCatalogItemIcon, getFullReferenceURI, getUpdates } from './utils';
import { useFetch } from '../../hooks/useFetch';
import { useTranslation } from '../../hooks/useTranslation';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import {
  APP_CATALOG_LABEL_KEY,
  APP_CHANNEL_LABEL_KEY,
  APP_ITEM_LABEL_KEY,
  OS_CATALOG_LABEL_KEY,
  OS_CHANNEL_LABEL_KEY,
  OS_ITEM_LABEL_KEY,
} from './const';
import { useCatalogItem } from './useCatalogs';

type UpdateInfoProps = {
  catalogItem: CatalogItem;
  channel: string;
  catalogItemVersion: CatalogItemVersion;
  onClick: VoidFunction;
  canEdit: boolean;
};

const UpdateInfo = ({ onClick, catalogItem, channel, catalogItemVersion, canEdit }: UpdateInfoProps) => {
  const { t } = useTranslation();
  const updates = getUpdates(catalogItem, channel, catalogItemVersion.version);

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

type InstalledSoftwareProps = {
  labels: Record<string, string> | undefined;
  spec: DeviceSpec | undefined;
  onDeleteOs: () => Promise<void>;
  onDeleteApp: (appName: string) => Promise<void>;
  onEdit: (catalogId: string, catalogItemId: string, appName?: string) => void;
  canEdit: boolean;
};

type AppItem = { item: CatalogItem; name: string };

const InstalledSoftware = ({ labels, spec, onDeleteOs, onDeleteApp, onEdit, canEdit }: InstalledSoftwareProps) => {
  const { t } = useTranslation();
  const [appItems, setAppItems] = React.useState<AppItem[]>();
  const [appsLoading, setAppsLoading] = React.useState(true);
  const [deleteOs, setDeleteOs] = React.useState(false);
  const [appToDelete, setAppToDelete] = React.useState<string>();
  const osItemId = labels?.[OS_ITEM_LABEL_KEY];
  const osChannel = labels?.[OS_CHANNEL_LABEL_KEY];
  const osCatalog = labels?.[OS_CATALOG_LABEL_KEY];

  const { get } = useFetch();

  const apps = React.useMemo(() => {
    if (!labels) {
      return [];
    }
    return Object.keys(labels).reduce(
      (acc, key) => {
        if (key.endsWith(APP_ITEM_LABEL_KEY)) {
          const appName = key.slice(0, -(APP_ITEM_LABEL_KEY.length + 1));
          const item = labels[`${appName}.${APP_ITEM_LABEL_KEY}`];
          const catalog = labels[`${appName}.${APP_CATALOG_LABEL_KEY}`];
          const channel = labels[`${appName}.${APP_CHANNEL_LABEL_KEY}`];
          if (item && catalog && channel && spec?.applications?.find((a) => a.name === appName)) {
            acc.push({
              item,
              catalog,
              channel,
              name: appName,
            });
          }
        }
        return acc;
      },
      [] as {
        item: string;
        catalog: string;
        channel: string;
        name: string;
      }[],
    );
  }, [labels, spec?.applications]);

  React.useEffect(() => {
    (async () => {
      const appRequests = apps.map((app) => get<CatalogItem>(`catalogs/${app.catalog}/items/${app.item}`));
      const results = await Promise.allSettled(appRequests);

      const items: AppItem[] = [];
      results.forEach((r, idx) => {
        if (r.status === 'rejected') {
          // eslint-disable-next-line no-console
          console.warn(`Failed to fetch catalog item ${apps[idx].catalog}/${apps[idx].item}`);
        } else {
          items.push({
            item: r.value,
            name: apps[idx].name,
          });
        }
      });
      setAppItems(items);
      setAppsLoading(false);
    })();
  }, [apps, get]);

  const [osItem, osLoading] = useCatalogItem(osCatalog, osItemId);

  if (osLoading || appsLoading) {
    return <EmptyState titleText={t('Loading installed software')} headingLevel="h4" icon={Spinner} />;
  }

  const catalogItemVersion = osItem?.spec.versions.find(
    (v) =>
      getFullReferenceURI(osItem.spec.reference.uri, v) === spec?.os?.image && v.channels.includes(osChannel || ''),
  );

  const hasOs = !!(osItem && osCatalog && osChannel && catalogItemVersion && spec);
  const hasApps = !!(appItems && appItems.length > 0);
  const isEmpty = !hasOs && !hasApps;

  return (
    <>
      <Card>
        <CardTitle>{t('Deployed Software')}</CardTitle>
        <CardBody>
          {isEmpty ? (
            <EmptyState headingLevel="h4" icon={CubeIcon} titleText={t('No software deployed')}>
              <EmptyStateBody>{t('Select an operating system or application from the catalog below.')}</EmptyStateBody>
            </EmptyState>
          ) : (
            <Stack hasGutter>
              {osItem && osCatalog && osChannel && catalogItemVersion && spec && (
                <StackItem key={osItem.metadata.name}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem grow={{ default: 'grow' }}>
                      <CatalogItemTitle item={osItem} channel={osChannel} version={catalogItemVersion.version} />
                    </FlexItem>
                    <FlexItem>
                      <UpdateInfo
                        catalogItem={osItem}
                        catalogItemVersion={catalogItemVersion}
                        channel={osChannel}
                        onClick={() => onEdit(osItem.metadata.catalog, osItem.metadata.name || '')}
                        canEdit={canEdit}
                      />
                    </FlexItem>
                    {(osItem.spec.deprecation || catalogItemVersion.deprecation) && (
                      <FlexItem>
                        <Popover
                          bodyContent={osItem.spec.deprecation?.message || catalogItemVersion.deprecation?.message}
                          withFocusTrap
                          triggerAction="click"
                        >
                          <Label variant="outline" color="orange">
                            {t('Deprecated')}
                          </Label>
                        </Popover>
                      </FlexItem>
                    )}
                    {canEdit && (
                      <FlexItem>
                        <ActionsColumn
                          items={[
                            {
                              title: t('Edit'),
                              onClick: () => onEdit(osItem.metadata.catalog, osItem.metadata.name || ''),
                            },
                            {
                              title: t('Delete'),
                              onClick: () => setDeleteOs(true),
                            },
                          ]}
                        />
                      </FlexItem>
                    )}
                  </Flex>
                </StackItem>
              )}
              {appItems?.map((app, index) => {
                const appChannel = labels?.[`${app.name}.${APP_CHANNEL_LABEL_KEY}`] || '';
                const appSpec = spec?.applications?.find((a) => a.name === app.name);
                const itemVersion =
                  appSpec &&
                  app.item.spec.versions.find((v) => {
                    const refUri = getFullReferenceURI(app.item.spec.reference.uri, v);
                    const imageMatches = refUri === (appSpec as ContainerApplication).image;
                    return imageMatches && v.channels.includes(appChannel);
                  });
                const actions: IAction[] = [
                  ...(itemVersion
                    ? [
                        {
                          title: t('Edit'),
                          onClick: () => onEdit(app.item.metadata.catalog, app.item.metadata.name || '', app.name),
                        },
                      ]
                    : []),
                  {
                    title: t('Delete'),
                    onClick: () => setAppToDelete(app.name),
                  },
                ];

                return (
                  <React.Fragment key={app.name}>
                    {(hasOs || index > 0) && <Divider />}
                    <StackItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem grow={{ default: 'grow' }}>
                          <CatalogItemTitle
                            item={app.item}
                            channel={appChannel}
                            version={itemVersion?.version}
                            appName={app.name}
                          />
                        </FlexItem>
                        <FlexItem>
                          {itemVersion && (
                            <UpdateInfo
                              catalogItem={app.item}
                              catalogItemVersion={itemVersion}
                              channel={appChannel}
                              onClick={() => onEdit(app.item.metadata.catalog, app.item.metadata.name || '', app.name)}
                              canEdit={canEdit}
                            />
                          )}
                        </FlexItem>
                        {(app.item.spec.deprecation || itemVersion?.deprecation) && (
                          <FlexItem>
                            <Popover
                              bodyContent={app.item.spec.deprecation?.message || itemVersion?.deprecation?.message}
                              withFocusTrap
                              triggerAction="click"
                            >
                              <Label variant="outline" color="orange">
                                {t('Deprecated')}
                              </Label>
                            </Popover>
                          </FlexItem>
                        )}
                        {canEdit && (
                          <FlexItem>
                            <ActionsColumn items={actions} />
                          </FlexItem>
                        )}
                      </Flex>
                    </StackItem>
                  </React.Fragment>
                );
              })}
            </Stack>
          )}
        </CardBody>
      </Card>
      {deleteOs && (
        <DeleteModal
          onClose={() => setDeleteOs(false)}
          onDelete={async () => {
            await onDeleteOs();
            setDeleteOs(false);
          }}
          resourceName={osItem?.spec.displayName || osItem?.metadata.name || ''}
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
