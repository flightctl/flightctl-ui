import * as React from 'react';
import {
  Alert,
  Bullseye,
  Button,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  ExpandableSection,
  ExpandableSectionToggle,
  Page,
  PageSection,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import ArrowLeftIcon from '@patternfly/react-icons/dist/js/icons/arrow-left-icon';

import { useFetch } from '../../hooks/useFetch';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppContext } from '../../hooks/useAppContext';
import { getErrorMessage } from '../../utils/error';
import { getBrandName } from '../../utils/brand';
import CopyButton from '../common/CopyButton';

import './CopyLoginCommandPage.css';

type SessionTokenResponse = {
  token: string;
  serviceUrl: string;
};

const DEFAULT_API_URL = '<API-URL>';
const TRUNCATED_COMMAND_LENGTH = 80;

const LoginCommandCopy = ({ loginCommand, brandName }: { loginCommand: string; brandName: string }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Truncate the command for initial display (show first part + ellipsis)
  const truncatedCommand =
    loginCommand.length > TRUNCATED_COMMAND_LENGTH
      ? `${loginCommand.substring(0, TRUNCATED_COMMAND_LENGTH)}`
      : loginCommand;

  return (
    <Stack hasGutter className="fctl-login-command__copy-content">
      <StackItem>
        <Alert variant="success" isInline title={t('Login successful!')} />
      </StackItem>
      <StackItem>
        {t('Copy and run this command in your terminal to authenticate to {{ brandName }}:', { brandName })}
      </StackItem>
      <StackItem>
        <CodeBlock
          actions={[
            <CodeBlockAction key="copy-command">
              <CopyButton text={loginCommand} ariaLabel={t('Copy login command')} />
            </CodeBlockAction>,
          ]}
        >
          <CodeBlockCode className="fctl-login-command__codeblock">
            {/* When the full command is shown, hide the truncated command. This allows the full command to be copied using the keyboard */}
            {isExpanded ? '' : `${truncatedCommand}...`}
            <ExpandableSection
              toggleText={isExpanded ? t('Show less') : t('Show more')}
              isExpanded={isExpanded}
              isDetached
              contentId="code-block-expand"
            >
              {loginCommand}
            </ExpandableSection>
            <ExpandableSectionToggle
              isExpanded={isExpanded}
              onToggle={(isExpanded) => setIsExpanded(isExpanded)}
              contentId="code-block-expand"
              direction={isExpanded ? 'up' : 'down'}
            >
              {isExpanded ? t('Show Less') : t('Show More')}
            </ExpandableSectionToggle>
          </CodeBlockCode>
        </CodeBlock>
      </StackItem>
      <StackItem>
        <Alert variant="info" title={t('Next steps')}>
          {t(
            "After running this command, you'll be authenticated and can use the {{ brandName }} CLI to manage your edge devices from your terminal.",
            { brandName },
          )}
        </Alert>
      </StackItem>
    </Stack>
  );
};

const CopyLoginCommandBody = ({ brandName }: { brandName: string }) => {
  const { t } = useTranslation();
  const { proxyFetch } = useFetch();

  const [loginCommand, setLoginCommand] = React.useState('');
  const [tokenNotFound, setTokenNotFound] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const sessionId = window.location.search.split('sessionId=')[1];

  React.useEffect(() => {
    const getSessionToken = async () => {
      try {
        const response = await proxyFetch(`/login/get-session-token?sessionId=${sessionId}`, {
          credentials: 'include',
        });
        if (response.status !== 200) {
          const tokenNotFound = response.status === 404;
          if (tokenNotFound) {
            setTokenNotFound(tokenNotFound);
          }
          throw new Error(t('Failed to obtain session token'));
        }
        const sessionToken = (await response.json()) as SessionTokenResponse;
        setLoginCommand(`flightctl login ${sessionToken.serviceUrl || DEFAULT_API_URL} --token=${sessionToken.token}`);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    };
    if (sessionId) {
      void getSessionToken();
    } else {
      setErrorMessage(t('This URL can only be used with a valid session ID'));
    }
  }, [sessionId, proxyFetch, t]);

  if (errorMessage) {
    const title = tokenNotFound
      ? t('The login command for this session is no longer available')
      : t('Error getting session token');
    const message = tokenNotFound
      ? t("This session's login token was already retrieved once, or you used the wrong URL.")
      : errorMessage;
    return (
      <Alert variant="danger" title={title}>
        {message}
        <br />
        {t('Please return to {{ brandName }} and request a new login command.', { brandName })}
      </Alert>
    );
  } else if (!loginCommand) {
    return <Spinner size="xl" />;
  }

  return <LoginCommandCopy loginCommand={loginCommand} brandName={brandName} />;
};

const CopyLoginCommandPage = () => {
  const { t } = useTranslation();

  const { settings } = useAppContext();
  const brandName = getBrandName(settings);

  const onSwitchBack = () => {
    // Try to focus back to the original tab, then close the current one
    (window.opener as Window)?.focus();
    window.close();
  };

  return (
    <Page>
      <PageSection variant="light" isFilled>
        <Stack hasGutter style={{ '--pf-v5-l-stack--m-gutter--Gap': '3rem' } as React.CSSProperties}>
          <StackItem>
            <Button variant="secondary" icon={<ArrowLeftIcon />} onClick={onSwitchBack}>
              {t('Back to {{ brandName }}', { brandName })}
            </Button>
          </StackItem>
          <StackItem />
          <StackItem>
            <Bullseye>
              <Stack hasGutter>
                <StackItem>
                  <Bullseye>
                    <Stack hasGutter style={{ textAlign: 'center' }}>
                      <StackItem>
                        <Title headingLevel="h1" size="2xl">
                          {brandName}
                        </Title>
                      </StackItem>
                      <StackItem>
                        <Title headingLevel="h4" size="md">
                          {t('CLI authentication portal')}
                        </Title>
                      </StackItem>
                    </Stack>
                  </Bullseye>
                </StackItem>
                <StackItem>
                  <CopyLoginCommandBody brandName={brandName} />
                </StackItem>
              </Stack>
            </Bullseye>
          </StackItem>
        </Stack>
      </PageSection>
    </Page>
  );
};

export default CopyLoginCommandPage;
