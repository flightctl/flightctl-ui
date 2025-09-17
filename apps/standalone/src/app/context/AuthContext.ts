import * as React from 'react';
import { loginAPI, redirectToLogin } from '../utils/apiCalls';

const AUTH_DISABLED_STATUS_CODE = 418;
const EXPIRATION = 'expiration';
export let lastRefresh = 0;

// max value for setTimeout
const maxTimeout = 2 ** 31 - 1;

const nowInSeconds = () => Math.round(Date.now() / 1000);

type AuthContextProps = {
  username: string;
  loading: boolean;
  authEnabled: boolean;
  error: string | undefined;
};

export const AuthContext = React.createContext<AuthContextProps>({
  username: '',
  authEnabled: true,
  loading: false,
  error: undefined,
});

export const useAuthContext = () => {
  const [username, setUsername] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [authEnabled, setAuthEnabled] = React.useState(true);
  const [error, setError] = React.useState<string>();
  const refreshRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    const getUserInfo = async () => {
      let callbackErr: string | null = null;
      if (window.location.pathname === '/callback') {
        localStorage.removeItem(EXPIRATION);
        localStorage.removeItem('flightctl-current-organization');
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        callbackErr = searchParams.get('error');
        if (code) {
          const resp = await fetch(loginAPI, {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({
              code: code,
            }),
          });
          const expiration = (await resp.json()) as { expiresIn: number };
          if (expiration.expiresIn) {
            const now = nowInSeconds();
            localStorage.setItem(EXPIRATION, `${now + expiration.expiresIn}`);
            lastRefresh = now;
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
            setAuthEnabled(false);
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
          const info = (await resp.json()) as { username: string };
          setUsername(info.username);
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
        if (!authEnabled) {
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
  }, [loading, authEnabled]);

  return { username, loading, authEnabled, error };
};
