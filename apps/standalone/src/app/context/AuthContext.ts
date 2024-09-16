import * as React from 'react';
import { loginAPI, redirectToLogin } from '../utils/apiCalls';

const AUTH_DISABLED_STATUS_CODE = 418;

type AuthContextProps = {
  username: string;
  loading: boolean;
  authEnabled: boolean;
};

export const AuthContext = React.createContext<AuthContextProps>({
  username: '',
  authEnabled: true,
  loading: false,
});

export const useAuthContext = () => {
  const [username, setUsername] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [authEnabled, setAuthEnabled] = React.useState(true);

  React.useEffect(() => {
    const getUserInfo = async () => {
      if (window.location.pathname === '/callback') {
        const searchParams = new URLSearchParams(window.location.search);
        await fetch(loginAPI, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          method: 'POST',
          body: JSON.stringify({
            code: searchParams.get('code'),
          }),
        });
      }
      try {
        const resp = await fetch(`${loginAPI}/info`, {
          credentials: 'include',
        });
        if (resp.status === AUTH_DISABLED_STATUS_CODE) {
          setAuthEnabled(false);
          setLoading(false);
          return;
        }
        if (resp.status !== 200) {
          redirectToLogin();
          return;
        }
        const info = (await resp.json()) as { preferred_username: string };
        setUsername(info.preferred_username);
        setLoading(false);
      } catch (err) {
        // TODO show err and retry btn
        // eslint-disable-next-line
        console.log(err);
        redirectToLogin();
      }
    };
    getUserInfo();
  }, []);

  return { username, loading, authEnabled };
};
