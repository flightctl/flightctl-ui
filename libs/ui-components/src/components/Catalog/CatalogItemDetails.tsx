import { CatalogItem, CatalogItemType } from '@flightctl/types/alpha';
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

import { useTranslation } from '../../hooks/useTranslation';
import { InstallSpec, InstallSpecFormik } from './InstallWizard/steps/SpecificationsStep';
import FlightCtlForm from '../form/FlightCtlForm';
import { getCatalogItemIcon } from './utils';

import './CatalogItemDetails.css';

type CatalogItemDetailsPanelProps = {
  item: CatalogItem;
  onClose: VoidFunction;
  canInstall: boolean;
};

type CatalogItemDetailsProps = CatalogItemDetailsPanelProps & {
  onInstall: (installItem: { item: CatalogItem; channel: string; version: string }) => void;
};

const getPageContentTop = () => {
  // Try multiple selectors to find the masthead
  const masthead =
    document.getElementById('stack-inline-masthead') ||
    document.querySelector('.pf-v5-c-masthead') ||
    document.querySelector('.pf-c-masthead') ||
    document.querySelector('[class*="masthead"]');

  return masthead?.getBoundingClientRect()?.bottom || 60;
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

const CatalogItemDetailsPanel = ({ item, onClose, canInstall }: CatalogItemDetailsPanelProps) => {
  const { t } = useTranslation();
  const topOffset = usePageContentTop();

  const {
    values: { version, channel },
    submitForm,
    isValid,
  } = useFormikContext<InstallSpecFormik>();

  const installEnabled = !!version && !!channel && canInstall;

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
        <Split hasGutter>
          <SplitItem>
            <img src={getCatalogItemIcon(item)} alt={`${item.metadata.name} icon`} style={{ maxWidth: '60px' }} />
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
        <DrawerActions>
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
              <Button onClick={submitForm} isDisabled={!installEnabled || !isValid}>
                {t('Deploy')}
              </Button>
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

  return createPortal(drawerWrapper, document.body);
};

type CatalogItemDetailsContentProps = {
  item: CatalogItem;
};

export const CatalogItemDetailsContent = ({ item }: CatalogItemDetailsContentProps) => {
  const { t } = useTranslation();

  const {
    values: { version },
  } = useFormikContext<InstallSpecFormik>();

  const readme = item.spec.versions.find((v) => v.version === version)?.readme;

  return (
    <Grid hasGutter>
      <GridItem span={3}>
        <DescriptionList>
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
  const channels = item.spec.versions.reduce((acc, v) => {
    v.channels.forEach((c) => (acc[c] = c));
    return acc;
  }, {});

  const versions = item.spec.versions.sort((v1, v2) => semver.compare(v2.version, v1.version));
  const channel = Object.keys(channels)[0];
  const channelVersions = versions.find((v) => v.channels.includes(channel));
  return {
    version: channelVersions?.version || '',
    channel,
  };
};

const CatalogItemDetails = ({ item, onInstall, ...rest }: CatalogItemDetailsProps) => {
  //reinitialize when item changes
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
