import * as React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

export const ScopesHelperText = () => {
  const { t } = useTranslation();
  return (
    <div>
      <p>
        <strong>{t('Purpose')}:</strong>
        {t('Scopes define the permissions your application requests from the provider.')}
      </p>
      <p>
        <strong>{t('Configuration')}:</strong> {t("Check your provider's documentation for required scopes.")}
      </p>
      <p>
        <strong>{t('Common examples')}:</strong> {t('openid, profile, email, groups.')}
      </p>
    </div>
  );
};

export const UsernameClaimHelperText = () => {
  const { t } = useTranslation();
  return (
    <div>
      <p>
        <strong>{t('Purpose')}:</strong> {t('The claim field that contains the username.')}
      </p>
      <p>
        <strong>{t('Format')}:</strong>{' '}
        {t(
          'Enter each segment of the claim path as a separate item. Simple claims like "email" require only one segment. For nested claims like "user.name", add multiple segments in order: first "user", then "name".',
        )}
      </p>
      <p>
        <strong>{t('Requirements')}:</strong>{' '}
        {t(
          'Each segment must start with a letter or underscore and contain only letters, numbers, dots or underscores.',
        )}
      </p>
    </div>
  );
};

export const RoleClaimHelperText = () => {
  const { t } = useTranslation();
  return (
    <div>
      <p>
        <strong>{t('Purpose')}:</strong>{' '}
        {t('The claim field that contains user roles or group memberships for authorization.')}
      </p>
      <p>
        <strong>{t('Configuration')}:</strong> {t("Refer to your provider's documentation for the correct claim path.")}
      </p>
      <p>
        <strong>{t('Format')}:</strong>{' '}
        {t('Use an array of path segments (e.g., ["groups"], ["roles"], ["realm_access", "roles"]).')}
      </p>
      <p>
        <strong>{t('Common examples')}:</strong> {t('["groups"], ["roles"], ["authorities"]')}
      </p>
    </div>
  );
};

export const RoleSeparatorHelperText = () => {
  const { t } = useTranslation();
  return (
    <div>
      <p>
        {t(
          'Separator for org:role format (default: ":"). Roles containing the separator are split into organization-scoped roles. Roles without separator are global and apply to all organizations. Example: "org1:flightctl-admin" becomes org-scoped role "flightctl-admin" for organization "org1", while "flightctl-admin" becomes a global role.',
        )}
      </p>
    </div>
  );
};
