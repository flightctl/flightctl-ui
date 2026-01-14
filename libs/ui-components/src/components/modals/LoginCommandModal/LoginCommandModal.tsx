import * as React from 'react';
import {
  Alert,
  Button,
  ClipboardCopy,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';

type LoginCommand = {
  providerName: string;
  displayName: string;
  command: string;
};

type LoginCommandModalProps = {
  onClose: VoidFunction;
};

const LoginCommandModal = ({ onClose }: LoginCommandModalProps) => {
  const { t } = useTranslation();
  const { proxyFetch } = useFetch();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>();
  const [loginCommands, setLoginCommands] = React.useState<LoginCommand[]>([]);

  React.useEffect(() => {
    const fetchLoginCommand = async () => {
      try {
        setLoading(true);
        setError(undefined);
        const response = await proxyFetch('login-command', {
          method: 'GET',
        });

        if (!response.ok) {
          let errorMessage = t('Failed to retrieve login command');
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = (await response.json()) as { error?: string };
              errorMessage = errorData.error || errorMessage;
            } else {
              const text = await response.text();
              if (text) {
                errorMessage = text;
              }
            }
          } catch (parseErr) {
            // If parsing fails, use default error message
          }
          setError(errorMessage);
          return;
        }

        const result = (await response.json()) as { commands: LoginCommand[] };
        if (result.commands.length === 0) {
          setError(t('No authentication providers available'));
          return;
        }
        setLoginCommands(result.commands);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchLoginCommand();
  }, [t, proxyFetch]);

  const title =
    loginCommands.length > 1
      ? t('Select your preferred provider and use the command to log in to the Flight Control CLI.')
      : t('Use the following command to log in to the Flight Control CLI:');

  return (
    <Modal isOpen onClose={onClose} variant="medium">
      <ModalHeader title={t('Copy Login Command')} />
      <ModalBody>
        <Stack hasGutter>
          {loading && (
            <StackItem>
              <Spinner size="lg" />
            </StackItem>
          )}

          {error && (
            <StackItem>
              <Alert isInline variant="danger" title={t('An error occurred')}>
                {error}
              </Alert>
            </StackItem>
          )}

          {!loading && !error && loginCommands.length > 0 && (
            <>
              <StackItem>
                <Content>{title}</Content>
              </StackItem>

              {loginCommands.map((cmd) => (
                <StackItem key={cmd.providerName}>
                  {loginCommands.length > 1 && (
                    <Content component="small" className="pf-v6-u-mb-sm">
                      <strong>
                        {t('Provider')}: {cmd.displayName || cmd.providerName}
                      </strong>
                    </Content>
                  )}
                  <ClipboardCopy isReadOnly hoverTip={t('Copy to clipboard')} clickTip={t('Copied!')}>
                    {cmd.command}
                  </ClipboardCopy>
                </StackItem>
              ))}
            </>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default LoginCommandModal;
