import * as React from 'react';
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
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  Grid,
  GridItem,
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import * as semver from 'semver';
import ReactMarkdown from 'react-markdown';
import { Formik, useFormikContext } from 'formik';
import { ActionsColumn, IAction } from '@patternfly/react-table';

import { type Catalog, type CatalogItem, CatalogItemType } from '@flightctl/types/alpha';
import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { useItemIsInUse } from './useCatalogItems';
import FlightCtlForm from '../form/FlightCtlForm';
import { DeprecateModal, RestoreModal } from './DeprecateModal';
import { getCatalogItemIcon, getFullContainerURI } from '../../utils/catalog';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import WithTooltip from '../common/WithTooltip';
import { buildAllDropdownActions } from '../common/ActionsDropdownList';
import FlightCtlPageDrawer from '../common/FlightCtlPageDrawer';
import { InstallSpec } from './InstallWizard/steps/SpecificationsStep';
import { InstallSpecFormik } from './InstallWizard/types';

import './CatalogItemDetails.css';

type CatalogItemActions = 'deprecate' | 'restore' | 'delete';

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

type CatalogItemDetailsModalProps = {
  item: CatalogItem;
  itemModalOpen: CatalogItemActions | undefined;
  setItemModalOpen: (itemModalOpen: CatalogItemActions | undefined) => void;
  refetch: VoidFunction;
  onClose: VoidFunction;
};

const CatalogItemDetailsModal = ({
  item,
  itemModalOpen,
  setItemModalOpen,
  refetch,
  onClose,
}: CatalogItemDetailsModalProps) => {
  const { t } = useTranslation();
  const { patch, remove } = useFetch();

  const displayName = item.spec.displayName || (item.metadata.name as string);
  const itemEndpoint = `catalogs/${item.metadata.catalog}/items/${item.metadata.name}`;

  switch (itemModalOpen) {
    case 'deprecate':
      return (
        <DeprecateModal
          itemName={displayName}
          onClose={() => setItemModalOpen(undefined)}
          onDeprecate={async (message) => {
            const isDeprecated = !!item.spec.deprecation;
            await patch(itemEndpoint, [
              {
                op: isDeprecated ? 'replace' : 'add',
                path: '/spec/deprecation',
                value: { message },
              },
            ]);
            refetch();
            setItemModalOpen(undefined);
          }}
        />
      );
    case 'restore':
      return (
        <RestoreModal
          itemName={displayName}
          onClose={() => setItemModalOpen(undefined)}
          onRestore={async () => {
            await patch(itemEndpoint, [
              {
                op: 'remove',
                path: '/spec/deprecation',
              },
            ]);
            refetch();
            setItemModalOpen(undefined);
          }}
        />
      );
    case 'delete':
      return (
        <DeleteModal
          resourceName={displayName}
          resourceType={t('catalog item')}
          onClose={() => setItemModalOpen(undefined)}
          onDelete={async () => {
            await remove(itemEndpoint);
            setItemModalOpen(undefined);
            refetch();
            onClose();
          }}
        />
      );
  }

  return null;
};

const CatalogItemPanelLink = ({ link }: { link: string | undefined }) => {
  const { t } = useTranslation();
  if (!link) {
    return t('N/A');
  }
  return (
    <Button component="a" variant="link" href={link} isInline target="_blank" rel="noopener noreferrer">
      {link}
    </Button>
  );
};

type CatalogItemDeployButtonProps = {
  item: CatalogItem;
  canInstall: boolean;
  targetHasOwner?: boolean;
  targetSet: boolean;
};

const CatalogItemDeployButton = ({ item, canInstall, targetHasOwner, targetSet }: CatalogItemDeployButtonProps) => {
  const { t } = useTranslation();
  const {
    submitForm,
    values: { version, channel },
  } = useFormikContext<InstallSpecFormik>();

  const disabledReasons: string[] = [];
  if (targetHasOwner) {
    disabledReasons.push(t('This resource is managed by an owner and cannot be modified directly'));
  } else if (!canInstall) {
    disabledReasons.push(t('You do not have permission to deploy'));
  }
  if (!channel) {
    disabledReasons.push(t('A channel must be selected'));
  }
  if (!version) {
    disabledReasons.push(t('A version must be selected'));
  }

  const catalogItemVersion = item.spec.versions.find((v) => v.version === version);
  if (catalogItemVersion) {
    // if target is given (fleet/device) or App catalog item is chosen, it must have container ref
    if (
      (targetSet || item.spec.type !== CatalogItemType.CatalogItemTypeOS) &&
      !getFullContainerURI(item.spec.artifacts, catalogItemVersion)
    ) {
      disabledReasons.push(t('This catalog item does not have a deployable artifact'));
    }
  }

  return (
    <WithTooltip
      showTooltip={!!disabledReasons.length}
      content={
        <Stack>
          {disabledReasons.map((reason, index) => (
            <StackItem key={index}>{reason}</StackItem>
          ))}
        </Stack>
      }
    >
      <Button onClick={submitForm} isAriaDisabled={!!disabledReasons.length}>
        {t('Deploy')}
      </Button>
    </WithTooltip>
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
  const navigate = useNavigate();

  const [itemModalOpen, setItemModalOpen] = React.useState<CatalogItemActions | undefined>(undefined);
  const isInUse = useItemIsInUse(item);

  const isDeprecated = !!item.spec.deprecation;
  const isManaged = !!item.metadata.owner;
  const managedActionDisabledReason = isManaged
    ? {
        content: t(
          "This catalog item is managed by a resource sync and cannot be modified directly. Either remove this catalog's definition from the resource sync configuration, or delete the resource sync first.",
        ),
      }
    : undefined;

  const regularActions: IAction[] = [];
  const dangerActions: IAction[] = [];
  if (showCatalogMgmt) {
    regularActions.push({
      title: isManaged ? t('View') : t('Edit'),
      onClick: () => {
        navigate({
          route: ROUTE.CATALOG_EDIT_ITEM,
          postfix: `${item.metadata.catalog}/${item.metadata.name}`,
        });
      },
    });
    if (isDeprecated) {
      regularActions.push({
        title: t('Restore'),
        onClick: () => setItemModalOpen('restore'),
        tooltipProps: managedActionDisabledReason,
        isAriaDisabled: !!managedActionDisabledReason,
      });
    } else {
      regularActions.push({
        title: t('Deprecate'),
        onClick: () => setItemModalOpen('deprecate'),
        tooltipProps: managedActionDisabledReason,
        isAriaDisabled: !!managedActionDisabledReason,
      });
    }

    // Adding delete action
    let disabledProps = managedActionDisabledReason;
    const isDisabled = isManaged || isInUse;
    if (!disabledProps && isInUse) {
      disabledProps = { content: t('This catalog item is being used in at least one fleet or device.') };
    }
    dangerActions.push({
      title: t('Delete'),
      onClick: () => setItemModalOpen('delete'),
      tooltipProps: disabledProps,
      isAriaDisabled: isDisabled,
    });
  }

  const catalogItemActions = buildAllDropdownActions(regularActions, dangerActions);

  return (
    <>
      <FlightCtlPageDrawer
        isExpanded
        panelContent={
          <>
            <DrawerHead>
              <CatalogItemDetailsHeader item={item} />
              <DrawerActions>
                {catalogItemActions.length > 0 && <ActionsColumn items={catalogItemActions} />}
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
                  <Alert
                    variant="info"
                    isInline
                    title={t('Data catalog item can be deployed as part of an application.')}
                  />
                ) : (
                  <StackItem>
                    <CatalogItemDeployButton
                      item={item}
                      canInstall={canInstall}
                      targetHasOwner={targetHasOwner}
                      targetSet={targetSet}
                    />
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
          </>
        }
      />
      <CatalogItemDetailsModal
        item={item}
        itemModalOpen={itemModalOpen}
        setItemModalOpen={setItemModalOpen}
        refetch={refetch}
        onClose={onClose}
      />
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
              <CatalogItemPanelLink link={item.spec.documentationUrl} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Support URL')}</DescriptionListTerm>
            <DescriptionListDescription className="fctl-catalog-item-details">
              <CatalogItemPanelLink link={item.spec.support} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Homepage')}</DescriptionListTerm>
            <DescriptionListDescription className="fctl-catalog-item-details">
              <CatalogItemPanelLink link={item.spec.homepage} />
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
