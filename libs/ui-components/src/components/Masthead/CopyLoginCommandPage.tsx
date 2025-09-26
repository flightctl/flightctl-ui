import * as React from 'react';
import {
  Alert,
  Brand,
  Button,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  Page,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import EyeSlashIcon from '@patternfly/react-icons/dist/js/icons/eye-slash-icon';
import EyeIcon from '@patternfly/react-icons/dist/js/icons/eye-icon';
import logo from '@fctl-assets/bgimages/flightctl-logo.svg';
import rhemLogo from '@fctl-assets/bgimages/RHEM-logo.svg';

import { useFetch } from '../../hooks/useFetch';
import { useTranslation } from '../../hooks/useTranslation';
import { getErrorMessage } from '../../utils/error';
import CopyButton from '../common/CopyButton';

type SessionTokenResponse = {
  token: string;
  serviceUrl: string;
};

const DEFAULT_API_URL = '<API-URL>';

const BrandHeader = ({ isRHEM }: { isRHEM: boolean }) => {
  return (
    <Masthead id="stack-inline-masthead">
      <MastheadMain>
        <MastheadBrand>
          {isRHEM ? (
            <Brand src={rhemLogo} alt="Red Hat Edge Manager logo" heights={{ default: '50px' }} />
          ) : (
            <Brand src={logo} alt="Flight Control Logo" heights={{ default: '30px' }} />
          )}
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent />
    </Masthead>
  );
};

const CopyLoginCommandPage = () => {
  const { proxyFetch } = useFetch();
  const { t } = useTranslation();
  const [loginToken, setLoginToken] = React.useState('');
  const [serviceUrl, setServiceUrl] = React.useState(DEFAULT_API_URL);
  const [showToken, setShowToken] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sessionId = window.location.search.split('sessionId=')[1];

  React.useEffect(() => {
    const getSessionToken = async () => {
      try {
        const response = await proxyFetch(`/login/get-session-token?sessionId=${sessionId}`, {
          credentials: 'include',
        });
        if (response.status !== 200) {
          setError(response.status === 404 ? t('Session token not found') : t('Unexpected server erro'));
          return;
        }
        const sessionToken = (await response.json()) as SessionTokenResponse;
        setLoginToken(sessionToken.token);
        setServiceUrl(sessionToken.serviceUrl);
      } catch (error) {
        setError(getErrorMessage(error));
      }
    };
    if (sessionId) {
      void getSessionToken();
    }
  }, [sessionId, proxyFetch, t]);

  const commandStart = `flightctl login ${serviceUrl} --token=`;

  const renderContent = () => {
    if (!sessionId) {
      return (
        <Alert variant="warning" title={t('Session ID not found')}>
          {t('No session ID was provided in the URL.')}
        </Alert>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" title={t('Error getting session token')}>
          {error}
        </Alert>
      );
    }

    if (!loginToken) {
      return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('Loading...')}</div>;
    }

    return (
      <CodeBlock
        actions={[
          <CodeBlockAction key="toggle-token">
            <Button
              variant="plain"
              onClick={() => setShowToken(!showToken)}
              icon={showToken ? <EyeSlashIcon /> : <EyeIcon />}
            >
              {showToken ? t('Hide token') : t('Show token')}
            </Button>
          </CodeBlockAction>,

          <CodeBlockAction key="copy-command">
            <CopyButton text={`${commandStart}${loginToken}`} ariaLabel={t('Copy login command')} />
          </CodeBlockAction>,
        ]}
      >
        <CodeBlockCode>
          {commandStart}
          {showToken ? loginToken : '<token>'}
        </CodeBlockCode>
      </CodeBlock>
    );
  };

  // @ts-ignore - window.isRHEM is defined in the browser
  const isRHEM = window.isRHEM || false;

  // CELIA-WIP NEEDS UX DESIGN AND NOT TO USE CUSTOM CSS

  return (
    <Page header={<BrandHeader isRHEM={isRHEM} />}>
      <PageSection variant="light" isFilled padding={{ default: 'noPadding' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <Title headingLevel="h1" size="2xl" style={{ marginBottom: '2rem' }}>
            {t('Copy login command')}
          </Title>
          <Stack hasGutter>
            <StackItem>{renderContent()}</StackItem>
            <StackItem>
              <Button variant="primary" onClick={() => window.close()}>
                {t('Close this page')}
              </Button>
            </StackItem>
          </Stack>
        </div>
      </PageSection>
    </Page>
  );
};

export default CopyLoginCommandPage;
