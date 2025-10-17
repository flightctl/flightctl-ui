import * as React from 'react';
import { loginAPI, redirectToLogin } from '../utils/apiCalls';
import { ORGANIZATION_STORAGE_KEY } from '@flightctl/ui-components/src/utils/organizationStorage';
import { AuthType } from '@flightctl/ui-components/src/types/extraTypes';
import { OAUTH_REDIRECT_AFTER_LOGIN_KEY } from '@flightctl/ui-components/src/constants';

const AUTH_DISABLED_STATUS_CODE = 418;
const EXPIRATION = 'expiration';
export let lastRefresh = 0;

// max value for setTimeout
const maxTimeout = 2 ** 31 - 1;

const nowInSeconds = () => Math.round(Date.now() / 1000);

const secondarySessionRedirectPages = ['copy-login-command'];

type AuthContextProps = {
  authType: AuthType;
  username: string;
  loading: boolean;
  error: string | undefined;
};

export const AuthContext = React.createContext<AuthContextProps>({
  authType: AuthType.DISABLED,
  username: '',
  loading: false,
  error: undefined,
});

export const useAuthContext = () => {
  const [username, setUsername] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [authType, setAuthType] = React.useState<AuthType>(AuthType.DISABLED);
  const [error, setError] = React.useState<string>();
  const refreshRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    const getUserInfo = async () => {
      let callbackErr: string | null = null;
      if (window.location.pathname === '/callback') {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        callbackErr = searchParams.get('error');

        if (code) {
          // Some pages require the user to re-authenticate for security reasons.
          // The token generated for these "secondary sessions" is independent of the primary session token.
          const redirectAfterLogin = localStorage.getItem(OAUTH_REDIRECT_AFTER_LOGIN_KEY);
          const isPrimarySession = !secondarySessionRedirectPages.includes(redirectAfterLogin || '');

          let loginEndpoint: string;
          if (isPrimarySession) {
            loginEndpoint = loginAPI;
            localStorage.removeItem(ORGANIZATION_STORAGE_KEY);
            localStorage.removeItem(EXPIRATION);
          } else {
            // Do not clear the localStorage items, otherwise they would be unset for the primary session too
            // We will force a new authentication flow that will allow us to retrieve the token from a newly generated sessionId
            loginEndpoint = `${loginAPI}/create-session-token`;
          }

          // In both cases, we trigger a new login flow
          const resp = await fetch(loginEndpoint, {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({
              code: code,
            }),
          });

          if (isPrimarySession) {
            const newLoginResponse = (await resp.json()) as { expiresIn: number };
            const now = nowInSeconds();
            localStorage.setItem(EXPIRATION, `${now + newLoginResponse.expiresIn}`);
            lastRefresh = now;
          } else {
            const newLoginResponse = (await resp.json()) as { sessionId: string };
            localStorage.removeItem(OAUTH_REDIRECT_AFTER_LOGIN_KEY);
            window.location.href = `/${redirectAfterLogin}?sessionId=${newLoginResponse.sessionId || ''}`;
          }
        } else if (callbackErr) {
          setError(callbackErr);
          setLoading(false);
        }
      }
      if (!callbackErr) {
        try {
          const resp = await fetch(`${loginAPI}/info`, {
            credentials: 'include',
          });
          if (resp.status === AUTH_DISABLED_STATUS_CODE) {
            setAuthType(AuthType.DISABLED);
            setLoading(false);
            return;
          }
          if (resp.status === 401) {
            await redirectToLogin();
            return;
          }
          if (resp.status !== 200) {
            setError('Failed to get user info');
            return;
          }
          const info = (await resp.json()) as { username: string; authType: AuthType };
          setUsername(info.username);
          setAuthType(info.authType);
          setLoading(false);
        } catch (err) {
          // eslint-disable-next-line
          console.log(err);
          setError('Failed to get user info');
        }
      }
    };

    getUserInfo();
  }, []);

  React.useEffect(() => {
    if (!loading) {
      const scheduleRefresh = () => {
        if (authType === AuthType.DISABLED) {
          return;
        }
        const expiresAt = parseInt(localStorage.getItem(EXPIRATION) || '0', 10);
        if (expiresAt > 0) {
          const now = nowInSeconds();
          // refresh 15s before expiration
          const expiresIn = expiresAt - now - 15;
          const timeout = Math.min(maxTimeout, expiresIn * 1000);
          if (timeout > 0) {
            refreshRef.current = setTimeout(refreshToken, timeout);
          }
        }
      };

      const refreshToken = async () => {
        try {
          const resp = await fetch(`${loginAPI}/refresh`, {
            credentials: 'include',
            method: 'GET',
          });
          const expiration = (await resp.json()) as { expiresIn: number };
          const now = nowInSeconds();
          if (expiration.expiresIn) {
            localStorage.setItem(EXPIRATION, `${now + expiration.expiresIn}`);
          } else {
            localStorage.removeItem(EXPIRATION);
          }
          lastRefresh = now;
        } catch (err) {
          // eslint-disable-next-line
          console.log('failed to refresh token:', err);
        } finally {
          scheduleRefresh();
        }
      };

      scheduleRefresh();
    }
    return () => clearTimeout(refreshRef.current);
  }, [loading, authType]);

  return { username, loading, authType, error };
};
