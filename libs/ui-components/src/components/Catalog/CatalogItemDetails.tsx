import { Catalog, CatalogItem, CatalogItemType } from '@flightctl/types/alpha';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Grid,
  GridItem,
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import * as React from 'react';
import { createPortal } from 'react-dom';
import * as semver from 'semver';
import ReactMarkdown from 'react-markdown';
import { Formik, useFormikContext } from 'formik';
import { ActionsColumn } from '@patternfly/react-table';

import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { InstallSpec } from './InstallWizard/steps/SpecificationsStep';
import FlightCtlForm from '../form/FlightCtlForm';
import { DeprecateModal, RestoreModal } from './DeprecateModal';
import { getCatalogItemIcon, getFullContainerURI } from './utils';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import WithTooltip from '../common/WithTooltip';
import { InstallSpecFormik } from './InstallWizard/types';

import './CatalogItemDetails.css';

type CatalogItemDetailsPanelProps = {
  item: CatalogItem;
  onClose: VoidFunction;
  canInstall: boolean;
  targetHasOwner?: boolean;
  refetch: VoidFunction;
  showCatalogMgmt: boolean;
  targetSet: boolean;
};

type CatalogItemDetailsProps = CatalogItemDetailsPanelProps & {
  onInstall: (installItem: { item: CatalogItem; channel: string; version: string }) => void;
};

const getPageContentTop = () => {
  // Try multiple selectors to find the masthead
  const masthead =
    document.getElementById('stack-inline-masthead') || // Standalone masthead
    document.getElementById('page-main-header'); // OCP Console masthead

  const pageTop = document.getElementById('fctl-cmd-panel');

  return masthead?.getBoundingClientRect()?.bottom || pageTop?.getBoundingClientRect()?.top || 60;
};

const usePageContentTop = () => {
  const [topOffset, setTopOffset] = React.useState(() => getPageContentTop());

  React.useEffect(() => {
    const measureTop = () => {
      setTopOffset(getPageContentTop());
    };

    // Measure immediately
    measureTop();

    // Also measure after a short delay in case layout isn't complete
    const timeoutId = setTimeout(measureTop, 50);

    window.addEventListener('resize', measureTop);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measureTop);
    };
  }, []);

  return topOffset;
};

type CatalogItemDetailsHeaderProps = {
  item: CatalogItem;
};

export const CatalogItemDetailsHeader = ({ item }: CatalogItemDetailsHeaderProps) => {
  const { t } = useTranslation();
  return (
    <Split hasGutter>
      <SplitItem>
        <img src={getCatalogItemIcon(item)} alt={`${item.metadata.name} icon`} style={{ maxWidth: '40px' }} />
      </SplitItem>
      <SplitItem isFilled>
        <Title headingLevel="h1">{item.spec.displayName || item.metadata.name}</Title>
        {item.spec.provider && (
          <Content component={ContentVariants.small}>
            {t('Provided by {{provider}}', { provider: item.spec.provider })}
          </Content>
        )}
      </SplitItem>
    </Split>
  );
};

const CatalogItemDetailsPanel = ({
  item,
  onClose,
  canInstall,
  targetHasOwner,
  refetch,
  showCatalogMgmt,
  targetSet,
}: CatalogItemDetailsPanelProps) => {
  const { t } = useTranslation();
  const topOffset = usePageContentTop();
  const navigate = useNavigate();
  const { patch, remove } = useFetch();
  const [isDeprecateModalOpen, setIsDeprecateModalOpen] = React.useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const isDeprecated = !!item.spec.deprecation;

  const {
    values: { version, channel },
    submitForm,
  } = useFormikContext<InstallSpecFormik>();

  const deployDisabledReasons: string[] = [];
  if (targetHasOwner) {
    deployDisabledReasons.push(t('This resource is managed by an owner and cannot be modified directly'));
  } else if (!canInstall) {
    deployDisabledReasons.push(t('You do not have permission to deploy'));
  }
  if (!channel) {
    deployDisabledReasons.push(t('A channel must be selected'));
  }
  if (!version) {
    deployDisabledReasons.push(t('A version must be selected'));
  }

  const catalogItemVersion = item.spec.versions.find((v) => v.version === version);
  if (catalogItemVersion) {
    // if target is given (fleet/device) or App catalog item is chosen, it must have container ref
    if (
      (targetSet || item.spec.type !== CatalogItemType.CatalogItemTypeOS) &&
      !getFullContainerURI(item.spec.artifacts, catalogItemVersion)
    ) {
      deployDisabledReasons.push('This catalog item does not have a deployable artifact');
    }
  }

  const isManaged = !!item.metadata.owner;

  const panelContent = (
    <DrawerPanelContent
      defaultSize="500px"
      minSize="400px"
      maxSize="1200px"
      isResizable
      resizeAriaLabel={t('Resize panel')}
      style={{ pointerEvents: 'auto', boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)' }}
    >
      <DrawerHead>
        <CatalogItemDetailsHeader item={item} />
        <DrawerActions>
          {showCatalogMgmt && (
            <ActionsColumn
              items={[
                {
                  title: isManaged ? t('View') : t('Edit'),
                  onClick: () => {
                    navigate({
                      route: ROUTE.CATALOG_EDIT_ITEM,
                      postfix: `${item.metadata.catalog}/${item.metadata.name}`,
                    });
                  },
                },
                isDeprecated
                  ? {
                      title: t('Restore'),
                      onClick: () => setIsRestoreModalOpen(true),
                      tooltipProps: isManaged
                        ? {
                            content: t(
                              "This catalog item is managed by a resource sync and cannot be directly restored. Either remove this catalog's definition from the resource sync configuration, or delete the resource sync first.",
                            ),
                          }
                        : undefined,
                      isAriaDisabled: isManaged,
                    }
                  : {
                      title: t('Deprecate'),
                      onClick: () => setIsDeprecateModalOpen(true),
                      tooltipProps: isManaged
                        ? {
                            content: t(
                              "This catalog item is managed by a resource sync and cannot be directly deprecated. Either remove this catalog's definition from the resource sync configuration, or delete the resource sync first.",
                            ),
                          }
                        : undefined,
                      isAriaDisabled: isManaged,
                    },
                {
                  title: t('Delete'),
                  onClick: () => setIsDeleteModalOpen(true),
                  tooltipProps: isManaged
                    ? {
                        content: t(
                          "This catalog item is managed by a resource sync and cannot be directly deleted. Either remove this catalog's definition from the resource sync configuration, or delete the resource sync first.",
                        ),
                      }
                    : undefined,
                  isAriaDisabled: isManaged,
                },
              ]}
            />
          )}
          <DrawerCloseButton onClose={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Stack hasGutter>
          <StackItem>
            <FlightCtlForm>
              <InstallSpec catalogItem={item} hideReadmeLink />
            </FlightCtlForm>
          </StackItem>
          {item.spec.type === CatalogItemType.CatalogItemTypeData ? (
            <Alert variant="info" isInline title={t('Data catalog item can be deployed as part of an application.')} />
          ) : (
            <StackItem>
              <WithTooltip
                showTooltip={!!deployDisabledReasons.length}
                content={
                  <Stack>
                    {deployDisabledReasons.map((reason, index) => (
                      <StackItem key={index}>{reason}</StackItem>
                    ))}
                  </Stack>
                }
              >
                <Button onClick={submitForm} isAriaDisabled={!!deployDisabledReasons.length}>
                  {t('Deploy')}
                </Button>
              </WithTooltip>
            </StackItem>
          )}
          <StackItem>
            <Divider />
          </StackItem>
          <StackItem>
            <CatalogItemDetailsContent item={item} />
          </StackItem>
        </Stack>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  const drawerWrapper = (
    <div
      style={{
        position: 'fixed',
        top: `${topOffset}px`,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 400,
        pointerEvents: 'none',
      }}
    >
      <Drawer isExpanded isInline position="end" style={{ height: '100%', width: '100%', pointerEvents: 'none' }}>
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody
            style={{
              background: 'transparent',
              pointerEvents: 'none',
            }}
          />
        </DrawerContent>
      </Drawer>
    </div>
  );

  return (
    <>
      {createPortal(drawerWrapper, document.body)}
      {isDeprecateModalOpen && (
        <DeprecateModal
          itemName={item.spec.displayName || item.metadata.name || ''}
          onClose={() => setIsDeprecateModalOpen(false)}
          onDeprecate={async (message) => {
            await patch(`catalogs/${item.metadata.catalog}/items/${item.metadata.name}`, [
              {
                op: isDeprecated ? 'replace' : 'add',
                path: '/spec/deprecation',
                value: { message },
              },
            ]);
            refetch();
            setIsDeprecateModalOpen(false);
          }}
        />
      )}
      {isRestoreModalOpen && (
        <RestoreModal
          itemName={item.spec.displayName || item.metadata.name || ''}
          onClose={() => setIsRestoreModalOpen(false)}
          onRestore={async () => {
            await patch(`catalogs/${item.metadata.catalog}/items/${item.metadata.name}`, [
              {
                op: 'remove',
                path: '/spec/deprecation',
              },
            ]);
            refetch();
            setIsRestoreModalOpen(false);
          }}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteModal
          resourceName={item.spec.displayName || item.metadata.name || ''}
          resourceType={t('catalog item')}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={async () => {
            await remove(`catalogs/${item.metadata.catalog}/items/${item.metadata.name}`);
            refetch();
            setIsDeleteModalOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

type CatalogItemDetailsContentProps = {
  item: CatalogItem;
};

export const CatalogItemDetailsContent = ({ item }: CatalogItemDetailsContentProps) => {
  const { t } = useTranslation();

  const {
    values: { version },
  } = useFormikContext<InstallSpecFormik>();

  const [catalog, loading] = useFetchPeriodically<Catalog>({
    endpoint: `catalogs/${item.metadata.catalog}`,
  });

  const readme = item.spec.versions.find((v) => v.version === version)?.readme;

  return (
    <Grid hasGutter>
      <GridItem span={3}>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Catalog')}</DescriptionListTerm>
            <DescriptionListDescription className="fctl-catalog-item-details">
              {loading ? <Spinner /> : catalog?.spec.displayName || item.metadata.catalog}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Provider')}</DescriptionListTerm>
            <DescriptionListDescription className="fctl-catalog-item-details">
              {item.spec.provider || t('N/A')}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Documentation URL')}</DescriptionListTerm>
            <DescriptionListDescription className="fctl-catalog-item-details">
              {item.spec.documentationUrl ? (
                <Button variant="link" href={item.spec.documentationUrl} isInline>
                  {item.spec.documentationUrl}
                </Button>
              ) : (
                t('N/A')
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Support URL')}</DescriptionListTerm>
            <DescriptionListDescription className="fctl-catalog-item-details">
              {item.spec.support ? (
                <Button variant="link" href={item.spec.support} isInline>
                  {item.spec.support}
                </Button>
              ) : (
                t('N/A')
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Homepage')}</DescriptionListTerm>
            <DescriptionListDescription className="fctl-catalog-item-details">
              {item.spec.homepage ? (
                <Button variant="link" href={item.spec.homepage} isInline>
                  {item.spec.homepage}
                </Button>
              ) : (
                t('N/A')
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </GridItem>
      <GridItem span={9}>
        <Content component={ContentVariants.h2}>{t('Description')}</Content>
        {item.spec.shortDescription || t('N/A')}
        <Content component={ContentVariants.h2}>{t('Readme')}</Content>
        {readme ? (
          <Content>
            <ReactMarkdown>{readme}</ReactMarkdown>
          </Content>
        ) : (
          t('N/A')
        )}
      </GridItem>
    </Grid>
  );
};

export const getDefaultChannelAndVersion = (item: CatalogItem) => {
  if (!item.spec.versions.length) {
    return {
      version: '',
      channel: '',
    };
  }

  const versions = item.spec.versions.sort((v1, v2) => semver.rcompare(v1.version, v2.version));

  // release then prerelease
  const latestVersion = versions.find((v) => !semver.prerelease(v.version)) || versions[0];

  return {
    version: latestVersion.version,
    channel: latestVersion.channels[0],
  };
};

const CatalogItemDetails = ({ item, onInstall, ...rest }: CatalogItemDetailsProps) => {
  // reinitialize when item changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialValues = React.useMemo(() => getDefaultChannelAndVersion(item), [item.metadata.name]);

  return (
    <Formik<InstallSpecFormik>
      initialValues={initialValues}
      enableReinitialize
      onSubmit={({ channel, version }) => {
        onInstall({ item, channel, version });
      }}
    >
      <CatalogItemDetailsPanel item={item} {...rest} />
    </Formik>
  );
};

export default CatalogItemDetails;
