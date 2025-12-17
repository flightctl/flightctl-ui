import * as React from 'react';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Alert,
  Bullseye,
  Button,
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  PageSection,
  Stack,
  StackItem,
  Text,
  TextContent,
  Title,
} from '@patternfly/react-core';
import { Modal, ModalBody, ModalHeader } from '@patternfly/react-core/next';

import { Organization } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { useOrganizationGuardContext } from './OrganizationGuard';
import { ORGANIZATION_STORAGE_KEY } from '../../utils/organizationStorage';

interface OrganizationSelectorContentProps {
  defaultOrganizationId?: string;
  organizations: Organization[];
  onSelect: (orgId: string) => void;
  onCancel?: () => void;
  allowCancel?: boolean;
  isFirstLogin?: boolean;
}

const MAX_ORGANIZATIONS_FOR_SCROLL = 4;
const EXTRA_DELAY = 450;

const OrganizationSelectorContent = ({
  defaultOrganizationId,
  organizations,
  onSelect,
  onCancel,
  allowCancel = false,
  isFirstLogin = false,
}: OrganizationSelectorContentProps) => {
  const { t } = useTranslation();
  const [selectedOrg, setSelectedOrg] = React.useState<string | undefined>(defaultOrganizationId);
  const needsScroll = organizations.length > MAX_ORGANIZATIONS_FOR_SCROLL;

  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text>
            {isFirstLogin
              ? t('You have access to multiple organizations. Please select one to continue.')
              : t('Please select an organization to continue. This will refresh the application.')}
          </Text>
        </TextContent>
      </StackItem>
      {organizations.length > 0 && (
        <StackItem>
          <Menu
            activeItemId={selectedOrg}
            selected={selectedOrg}
            onSelect={(_ev, orgId) => setSelectedOrg(orgId as string)}
            isScrollable={needsScroll}
          >
            <MenuContent menuHeight={needsScroll ? '230px' : 'auto'}>
              <MenuList>
                {organizations.map((org) => {
                  const orgId = org.metadata?.name as string;
                  return (
                    <MenuItem itemId={orgId} key={orgId}>
                      {org.spec?.displayName || orgId}
                    </MenuItem>
                  );
                })}
              </MenuList>
            </MenuContent>
          </Menu>
        </StackItem>
      )}
      {organizations.length > 0 && (
        <StackItem>
          <ActionList>
            <ActionListGroup>
              <ActionListItem>
                <Button variant="primary" onClick={() => onSelect(selectedOrg as string)} isDisabled={!selectedOrg}>
                  {t('Continue')}
                </Button>
              </ActionListItem>
              {allowCancel && (
                <ActionListItem>
                  <Button variant="link" onClick={onCancel}>
                    {t('Cancel')}
                  </Button>
                </ActionListItem>
              )}
            </ActionListGroup>
          </ActionList>
        </StackItem>
      )}
    </Stack>
  );
};

const OrganizationSelectorCustomModal = (props: OrganizationSelectorContentProps) => {
  const { t } = useTranslation();

  return (
    <PageSection variant="light">
      <Bullseye>
        <Card isLarge>
          <CardTitle>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
              <FlexItem>
                <Title headingLevel="h1" size="2xl">
                  {t('Select Organization')}
                </Title>
              </FlexItem>
            </Flex>
          </CardTitle>
          <CardBody>
            <OrganizationSelectorContent {...props} isFirstLogin />
          </CardBody>
        </Card>
      </Bullseye>
    </PageSection>
  );
};

interface OrganizationSelectorProps {
  onClose?: (isChanged: boolean) => void;
  isFirstLogin: boolean;
}

const OrganizationSelector = ({ onClose, isFirstLogin = true }: OrganizationSelectorProps) => {
  const {
    availableOrganizations,
    selectOrganization,
    mustShowOrganizationSelector,
    selectionError,
    isEmptyOrganizations,
    refetch,
    isReloading,
  } = useOrganizationGuardContext();
  const { t } = useTranslation();

  const getLastSelectedOrganization = React.useCallback(() => {
    try {
      const savedOrgId = localStorage.getItem(ORGANIZATION_STORAGE_KEY);
      if (savedOrgId && availableOrganizations.some((org) => org.metadata?.name === savedOrgId)) {
        return savedOrgId;
      }
    } catch (error) {
      // Ignore - we won't preselect the previously selected organization
    }
    return undefined;
  }, [availableOrganizations]);

  const handleSelect = React.useCallback(
    (orgId: string) => {
      const org = availableOrganizations.find((org) => org.metadata?.name === orgId);
      if (org) {
        try {
          selectOrganization(org);
          onClose?.(true);
        } catch (error) {
          onClose?.(false);
        }
      }
    },
    [availableOrganizations, selectOrganization, onClose],
  );

  const handleRefetch = React.useCallback(async () => {
    await refetch(EXTRA_DELAY);
  }, [refetch]);

  if (selectionError) {
    return (
      <PageSection variant="light">
        <Bullseye>
          <Alert variant="danger" title={t('Unable to log in to the application')} isInline>
            <TextContent>
              {isEmptyOrganizations ? (
                <>
                  <Text>{t('You do not have access to any organizations.')}</Text>
                  <Text>{t('Please contact your administrator to be granted access to an organization.')}</Text>
                </>
              ) : (
                <>
                  <Text>
                    {t('We cannot log you in as we could not determine what organizations you have access to.')}
                  </Text>
                  <Text>
                    {t('Please try refreshing the page. If the problem persists, contact your administrator.')}
                  </Text>
                  <Text component="pre">
                    <details>
                      <summary>{t('Error details')}:</summary>
                      {selectionError}
                    </details>
                  </Text>
                </>
              )}
            </TextContent>
            <ActionList className="pf-v5-u-mt-md">
              <ActionListGroup>
                <ActionListItem>
                  <Button variant="primary" onClick={handleRefetch} isDisabled={isReloading}>
                    {t('Reload organizations')}
                  </Button>
                </ActionListItem>
              </ActionListGroup>
            </ActionList>
          </Alert>
        </Bullseye>
      </PageSection>
    );
  }

  const commonProps = {
    defaultOrganizationId: getLastSelectedOrganization(),
    organizations: availableOrganizations,
    onSelect: handleSelect,
    onCancel: () => onClose?.(false),
    allowCancel: !mustShowOrganizationSelector,
  };

  // The modal for selecting an organization can be displayed in two ways:
  // If the user has not yet selected an organization - the modal is not dismissable and it's a custom "Modal" which allows interacting with the user menu.
  // If the user already logged in and selected an organization - the modal is dismissable and it overlays the entire page.
  return isFirstLogin ? (
    <OrganizationSelectorCustomModal {...commonProps} />
  ) : (
    <Modal variant="medium" isOpen onClose={() => onClose?.(false)}>
      <ModalHeader title={t('Select Organization')} />
      <ModalBody>
        <OrganizationSelectorContent {...commonProps} isFirstLogin={false} />
      </ModalBody>
    </Modal>
  );
};

export default OrganizationSelector;
