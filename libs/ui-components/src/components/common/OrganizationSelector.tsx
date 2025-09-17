import * as React from 'react';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
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
  const hasUserMadeSelection = React.useRef(false);
  const needsScroll = organizations.length > MAX_ORGANIZATIONS_FOR_SCROLL;

  // Only set default organization if user hasn't made a manual selection yet
  React.useEffect(() => {
    if (defaultOrganizationId && !hasUserMadeSelection.current && !selectedOrg) {
      setSelectedOrg(defaultOrganizationId);
    }
  }, [defaultOrganizationId, selectedOrg]);

  const handleOrgSelection = React.useCallback((orgId: string) => {
    hasUserMadeSelection.current = true;
    setSelectedOrg(orgId);
  }, []);

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
      <StackItem>
        <Menu
          activeItemId={selectedOrg}
          selected={selectedOrg}
          onSelect={(_ev, orgId) => handleOrgSelection(orgId as string)}
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
  const { availableOrganizations, selectOrganization, isOrganizationSelectionRequired } = useOrganizationGuardContext();
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

  const commonProps = {
    defaultOrganizationId: getLastSelectedOrganization(),
    organizations: availableOrganizations,
    onSelect: handleSelect,
    onCancel: () => onClose?.(false),
    allowCancel: !isOrganizationSelectionRequired,
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
