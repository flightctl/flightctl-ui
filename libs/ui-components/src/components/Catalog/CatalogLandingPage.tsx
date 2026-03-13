import * as React from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Divider,
  Grid,
  GridItem,
  Icon,
  List,
  ListItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/js/icons/cubes-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import UploadIcon from '@patternfly/react-icons/dist/js/icons/upload-icon';
import BookOpenIcon from '@patternfly/react-icons/dist/js/icons/book-open-icon';
import ArrowRightIcon from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';
import AngleDownIcon from '@patternfly/react-icons/dist/js/icons/angle-down-icon';
import AngleUpIcon from '@patternfly/react-icons/dist/js/icons/angle-up-icon';

import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from '../common/PermissionsContext';
import WithTooltip from '../common/WithTooltip';

import './CatalogLandingPage.css';

const CardSection = ({
  children,
  title,
  icon,
  onExpand,
  isExpanded,
}: React.PropsWithChildren<{
  title: React.ReactNode;
  icon: React.ReactNode;
  onExpand: VoidFunction;
  isExpanded: boolean;
}>) => {
  return (
    <>
      <CardHeader onClick={onExpand} role="button" className="fctl-catalog-landing__header">
        <Split hasGutter>
          <SplitItem>
            <Icon size="xl">{icon}</Icon>
          </SplitItem>
          <SplitItem isFilled>
            <CardTitle>{title}</CardTitle>
          </SplitItem>
          <SplitItem>{isExpanded ? <AngleUpIcon /> : <AngleDownIcon />}</SplitItem>
        </Split>
      </CardHeader>
      {isExpanded && <CardBody className="fctl-catalog-landing__card-body">{children}</CardBody>}
    </>
  );
};

const catalogPermissions = [
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.CREATE },
  { kind: RESOURCE.REPOSITORY, verb: VERB.CREATE },
  { kind: RESOURCE.RESOURCE_SYNC, verb: VERB.CREATE },
  { kind: RESOURCE.CATALOG, verb: VERB.CREATE },
  { kind: RESOURCE.CATALOG_ITEM, verb: VERB.CREATE },
];

const CatalogLandingPage = () => {
  const { checkPermissions } = usePermissionsContext();
  const [canCreateImageBuild, canCreateRepo, canCreateRS, canCreateCatalog, canCreateCatalogItem] =
    checkPermissions(catalogPermissions);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = React.useState<string>();

  const toggleExpand = (item: string) => setExpandedItem(expandedItem === item ? undefined : item);

  return (
    <Stack hasGutter>
      <StackItem>
        <Alert isInline variant="info" title={t('The Software Catalog is evolving')}>
          {t(
            'We are building a library of one-click, agent-driven catalog items. In the meantime, you can securely add your preferred items and build custom images by first configuring your prerequisites.',
          )}
        </Alert>
      </StackItem>
      <StackItem>
        <Grid hasGutter lg={7} md={10} sm={12}>
          <GridItem>
            <Stack hasGutter>
              <StackItem>
                <Content component="h2">{t('Available now')}</Content>
                <Content component={ContentVariants.p}>
                  {t("Explore what's available to customize and deploy your edge images.")}
                </Content>
              </StackItem>
              <StackItem>
                <Card isExpanded={!!expandedItem}>
                  <CardSection
                    title={t('Build custom images')}
                    icon={<CubesIcon />}
                    isExpanded={expandedItem === 'buildImages'}
                    onExpand={() => toggleExpand('buildImages')}
                  >
                    <Stack hasGutter>
                      <StackItem>
                        {t(
                          'Build a deployment-ready image tailored to your needs \u2013 pick your packages, settings, and policies, then test and share it with your team.',
                        )}
                      </StackItem>
                      <StackItem>
                        <List>
                          <ListItem>
                            {t(
                              'Click "Start a build" and walk through the steps to choose your packages, configurations, and security policies.',
                            )}
                          </ListItem>
                          <ListItem>
                            {t('Review everything and kick off the build to generate your custom image.')}
                          </ListItem>
                          <ListItem>
                            {t(
                              "Once it's ready, test the image and promote it to the Software Catalog so everyone on your team can use it.",
                            )}
                          </ListItem>
                        </List>
                      </StackItem>
                      <StackItem>
                        <WithTooltip
                          showTooltip={!canCreateImageBuild}
                          content={t("You don't have permissions to create image builds")}
                        >
                          <Button
                            variant="secondary"
                            icon={<ArrowRightIcon />}
                            iconPosition="end"
                            onClick={() => navigate(ROUTE.IMAGE_BUILD_CREATE)}
                            isAriaDisabled={!canCreateImageBuild}
                          >
                            {t('Start a build')}
                          </Button>
                        </WithTooltip>
                      </StackItem>
                    </Stack>
                  </CardSection>
                  <Divider />
                  <CardSection
                    title={t('Create a new catalog item')}
                    icon={<PlusCircleIcon />}
                    isExpanded={expandedItem === 'createItem'}
                    onExpand={() => toggleExpand('createItem')}
                  >
                    <Stack hasGutter>
                      <StackItem>
                        {t(
                          'Add a custom application or OS image to your Software Catalog for streamlined deployment across your fleet.',
                        )}
                      </StackItem>
                      <StackItem>
                        <List>
                          <ListItem>{t("Define the item's metadata, versions, and channels.")}</ListItem>
                          <ListItem>{t('Specify container images or OS artifacts.')}</ListItem>
                          <ListItem>
                            {t('Once created, the item is available for deployment from the catalog.')}
                          </ListItem>
                        </List>
                      </StackItem>
                      <StackItem>
                        <WithTooltip
                          showTooltip={!canCreateCatalog || !canCreateCatalogItem}
                          content={t("You don't have permissions to create catalogs")}
                        >
                          <Button
                            variant="secondary"
                            icon={<ArrowRightIcon />}
                            iconPosition="end"
                            onClick={() => navigate(ROUTE.CATALOG_ADD_ITEM)}
                            isAriaDisabled={!canCreateCatalog || !canCreateCatalogItem}
                          >
                            {t('Create item')}
                          </Button>
                        </WithTooltip>
                      </StackItem>
                    </Stack>
                  </CardSection>
                  <Divider />
                  <CardSection
                    title={t('Import catalog')}
                    icon={<UploadIcon />}
                    isExpanded={expandedItem === 'importCatalog'}
                    onExpand={() => toggleExpand('importCatalog')}
                  >
                    <Stack hasGutter>
                      <StackItem>
                        {t(
                          'Already have a catalog defined in an external repository? Sync it directly into your Software Catalog in just a few steps.',
                        )}
                      </StackItem>
                      <StackItem>
                        <List>
                          <ListItem>{t('Head over to Repositories and create a new one.')}</ListItem>
                          <ListItem>{t('Point it to the repository where your catalog definition lives.')}</ListItem>
                          <ListItem>
                            {t('Give it a few minutes — your catalog items will show up automatically.')}
                          </ListItem>
                        </List>
                      </StackItem>
                      <StackItem>
                        <WithTooltip
                          showTooltip={!canCreateRepo || !canCreateRS}
                          content={t("You don't have permissions to import catalogs")}
                        >
                          <Button
                            variant="secondary"
                            icon={<ArrowRightIcon />}
                            iconPosition="end"
                            onClick={() => navigate(ROUTE.REPO_CREATE, { isCatalogSync: 'true' })}
                            isAriaDisabled={!canCreateRepo || !canCreateRS}
                          >
                            {t('Import')}
                          </Button>
                        </WithTooltip>
                      </StackItem>
                    </Stack>
                  </CardSection>
                  <Divider />
                  <CardSection
                    title={t('Learn more')}
                    icon={<BookOpenIcon />}
                    isExpanded={expandedItem === 'learnMore'}
                    onExpand={() => toggleExpand('learnMore')}
                  >
                    <Stack hasGutter>
                      <StackItem>
                        {t('Explore documentation and resources to get the most out of the Software Catalog.')}
                      </StackItem>
                      <StackItem>
                        <List>
                          <ListItem>{t('Learn how to create and manage catalog items.')}</ListItem>
                          <ListItem>{t('Understand channels, versions, and deployment workflows.')}</ListItem>
                        </List>
                      </StackItem>
                    </Stack>
                  </CardSection>
                </Card>
              </StackItem>
            </Stack>
          </GridItem>
        </Grid>
      </StackItem>
    </Stack>
  );
};

export default CatalogLandingPage;
