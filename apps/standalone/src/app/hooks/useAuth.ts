import { useAuth as useOIDCAuth } from 'react-oidc-context';

export const useAuth = () => {
  if (window.KEYCLOAK_AUTHORITY) {
    // KEYCLOAK_AUTHORITY is defined during app start so it's safe to call the hook conditionally
    // eslint-disable-next-line
    return useOIDCAuth();
  }
  return undefined;
};
