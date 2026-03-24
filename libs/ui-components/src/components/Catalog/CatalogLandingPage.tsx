import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Gallery,
  Icon,
  List,
  ListItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Trans } from 'react-i18next';
import BuilderImageIcon from '@patternfly/react-icons/dist/js/icons/builder-image-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import ImportIcon from '@patternfly/react-icons/dist/js/icons/import-icon';
import BookOpenIcon from '@patternfly/react-icons/dist/js/icons/book-open-icon';
import ArrowRightIcon from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';
import activeColor from '@patternfly/react-tokens/dist/js/t_color_blue_50';

import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from '../common/PermissionsContext';
import WithTooltip from '../common/WithTooltip';
import LearnMoreLink from '../common/LearnMoreLink';
import { useAppLinks } from '../../hooks/useAppLinks';
import ResourceListEmptyState from '../common/ResourceListEmptyState';

const GettingStartedCard = ({
  children,
  title,
  icon,
  footer,
}: React.PropsWithChildren<{
  title: React.ReactNode;
  icon: React.ReactNode;
  footer: React.ReactNode;
}>) => {
  return (
    <Card>
      <CardHeader>
        <Stack hasGutter>
          <StackItem>
            <Icon size="2xl" style={{ '--pf-v6-c-icon__content--Color': activeColor.value } as React.CSSProperties}>
              {icon}
            </Icon>
          </StackItem>
          <StackItem>
            <CardTitle>{title}</CardTitle>
          </StackItem>
        </Stack>
      </CardHeader>
      <CardBody>{children}</CardBody>
      <CardFooter>{footer}</CardFooter>
    </Card>
  );
};

const catalogPermissions = [
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.CREATE },
  { kind: RESOURCE.REPOSITORY, verb: VERB.LIST },
  { kind: RESOURCE.RESOURCE_SYNC, verb: VERB.CREATE },
  { kind: RESOURCE.CATALOG, verb: VERB.CREATE },
  { kind: RESOURCE.CATALOG_ITEM, verb: VERB.CREATE },
];

type LandingPagePermissions = {
  shouldShowCards: boolean;
  permissions: [boolean, boolean, boolean, boolean, boolean];
};

export const useLandingPagePermissions = (): LandingPagePermissions => {
  const { checkPermissions } = usePermissionsContext();
  const [canCreateImageBuild, canListRepo, canCreateRS, canCreateCatalog, canCreateCatalogItem] =
    checkPermissions(catalogPermissions);

  return {
    shouldShowCards: canCreateImageBuild || (canListRepo && canCreateRS) || (canCreateCatalog && canCreateCatalogItem),
    permissions: [canCreateImageBuild, canListRepo, canCreateRS, canCreateCatalog, canCreateCatalogItem],
  };
};

const CatalogLandingPage = () => {
  const catalogDocsLink = useAppLinks('catalog');
  const { t } = useTranslation();
  const { shouldShowCards, permissions } = useLandingPagePermissions();

  return shouldShowCards ? (
    <CatalogLandingPageContent permissions={permissions} />
  ) : (
    <ResourceListEmptyState icon={BookOpenIcon} titleText={t('The Software Catalog is currently empty')}>
      <EmptyStateBody>
        <Trans t={t}>
          There are no items available to view. You have <b>view-only permissions</b> and cannot add or manage items.
          Please contact your internal administrator for access or catalog details.
        </Trans>
      </EmptyStateBody>
      {catalogDocsLink && (
        <EmptyStateFooter>
          <EmptyStateActions>
            <LearnMoreLink
              link={catalogDocsLink}
              text={t('Learn more about the Software Catalog in our documentation')}
            />
          </EmptyStateActions>
        </EmptyStateFooter>
      )}
    </ResourceListEmptyState>
  );
};

export const CatalogLandingPageContent = ({ permissions }: Pick<LandingPagePermissions, 'permissions'>) => {
  const catalogDocsLink = useAppLinks('catalog');
  const [canCreateImageBuild, canListRepo, canCreateRS, canCreateCatalog, canCreateCatalogItem] = permissions;

  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Gallery hasGutter>
      <GettingStartedCard
        title={t('Build custom images')}
        icon={<BuilderImageIcon />}
        footer={
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
        }
      >
        <Stack hasGutter>
          <StackItem>
            {t('Build a deployment-ready image tailored to your needs, then test and share it with your team.')}
          </StackItem>
          <StackItem>
            <List>
              <ListItem>{t('Click "Start a build" and walk through the steps to build your own image.')}</ListItem>
              <ListItem>{t('Review everything and kick off the build to generate your custom image.')}</ListItem>
              <ListItem>
                {t(
                  "Once it's ready, test the image and promote it to the Software Catalog so everyone on your team can use it.",
                )}
              </ListItem>
            </List>
          </StackItem>
        </Stack>
      </GettingStartedCard>
      <GettingStartedCard
        title={t('Create a new catalog item')}
        icon={<PlusCircleIcon />}
        footer={
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
        }
      >
        <Stack hasGutter>
          <StackItem>
            {t('Start from scratch and define a brand-new catalog item with the details and settings you need.')}
          </StackItem>
          <StackItem>
            <List>
              <ListItem>{t('Click "Create item" below to get started.')}</ListItem>
              <ListItem>{t('Enter a name, description, version, and any other details for your item.')}</ListItem>
              <ListItem>
                {t('Choose your source and deployment settings, then publish it so your team can use it.')}
              </ListItem>
            </List>
          </StackItem>
        </Stack>
      </GettingStartedCard>
      <GettingStartedCard
        title={t('Import catalog')}
        icon={<ImportIcon />}
        footer={
          <WithTooltip
            showTooltip={!canListRepo || !canCreateRS}
            content={t("You don't have permissions to import catalogs")}
          >
            <Button
              variant="secondary"
              icon={<ArrowRightIcon />}
              iconPosition="end"
              onClick={() => navigate(ROUTE.CATALOG_IMPORT)}
              isAriaDisabled={!canListRepo || !canCreateRS}
            >
              {t('Import')}
            </Button>
          </WithTooltip>
        }
      >
        <Stack hasGutter>
          <StackItem>
            {t(
              'Already have a catalog defined in an external repository? Sync it directly into your Software Catalog in just a few steps.',
            )}
          </StackItem>
          <StackItem>
            <List>
              <ListItem>{t('Head over to Repositories and create a new repository.')}</ListItem>
              <ListItem>{t('Point repository to where your catalog definition lives.')}</ListItem>
              <ListItem>{t('Give it a few minutes — your catalog items will show up automatically.')}</ListItem>
            </List>
          </StackItem>
        </Stack>
      </GettingStartedCard>
      {catalogDocsLink && (
        <GettingStartedCard
          title={t('Learn more')}
          icon={<BookOpenIcon />}
          footer={<LearnMoreLink link={catalogDocsLink} text={t('View documentation')} />}
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
        </GettingStartedCard>
      )}
    </Gallery>
  );
};

export default CatalogLandingPage;
