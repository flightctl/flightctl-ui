import * as React from 'react';
import { ActionsColumn, IAction, Td, Tr } from '@patternfly/react-table';
import { Label } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import TimesCircleIcon from '@patternfly/react-icons/dist/js/icons/times-circle-icon';
import { AuthProvider } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, ROUTE, useNavigate } from '../../hooks/useNavigate';
import { RESOURCE, VERB } from '../../types/rbac';
import { DynamicAuthProviderSpec, ProviderType } from '../../types/extraTypes';
import { isOAuth2Provider } from './CreateAuthProvider/types';
import { getProviderTypeLabel } from './CreateAuthProvider/utils';
import { usePermissionsContext } from '../common/PermissionsContext';

const authProviderPermissions = [
  { kind: RESOURCE.AUTH_PROVIDER, verb: VERB.UPDATE },
  { kind: RESOURCE.AUTH_PROVIDER, verb: VERB.DELETE },
];

const AuthProviderRow = ({ provider, onDeleteClick }: { provider: AuthProvider; onDeleteClick: VoidFunction }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const providerName = provider.metadata.name || '';
  const providerSpec = provider.spec as DynamicAuthProviderSpec;

  const { checkPermissions } = usePermissionsContext();
  const [canEdit, canDelete] = checkPermissions(authProviderPermissions);

  const actions: IAction[] = [
    {
      title: t('View details'),
      onClick: () => navigate({ route: ROUTE.AUTH_PROVIDER_DETAILS, postfix: providerName }),
    },
  ];

  if (canEdit) {
    const isDisableEdit = providerSpec.providerType === ProviderType.OAuth2;
    actions.push({
      title: t('Edit'),
      isAriaDisabled: isDisableEdit,
      tooltipProps: isDisableEdit
        ? {
            content: t('OAuth2 providers can only be edited via the YAML editor'),
          }
        : undefined,
      onClick: () => navigate({ route: ROUTE.AUTH_PROVIDER_EDIT, postfix: providerName }),
    });
  }

  if (canDelete) {
    actions.push({
      title: t('Delete'),
      onClick: onDeleteClick,
    });
  }

  let url: string = 'N/A';
  let urlTitle: string = '';
  if (isOAuth2Provider(providerSpec)) {
    url = providerSpec.authorizationUrl;
    urlTitle = t('Authorization URL');
  } else {
    url = providerSpec.issuer;
    urlTitle = t('Issuer URL');
  }

  const isEnabled = providerSpec.enabled ?? true;

  return (
    <Tr>
      <Td dataLabel={t('Name')}>
        <Link to={{ route: ROUTE.AUTH_PROVIDER_DETAILS, postfix: providerName }}>{providerName}</Link>
      </Td>
      <Td dataLabel={t('Display name')}>{providerSpec.displayName || providerName}</Td>
      <Td dataLabel={t('Type')}>
        <Label color="blue">{getProviderTypeLabel(providerSpec.providerType, t)}</Label>
      </Td>
      <Td dataLabel={urlTitle}>{url || 'N/A'}</Td>
      <Td dataLabel={t('Enabled')}>
        <Label color={isEnabled ? 'green' : 'grey'} icon={isEnabled ? <CheckCircleIcon /> : <TimesCircleIcon />}>
          {isEnabled ? t('Enabled') : t('Disabled')}
        </Label>
      </Td>
      <Td isActionCell>
        <ActionsColumn items={actions} />
      </Td>
    </Tr>
  );
};

export default AuthProviderRow;
