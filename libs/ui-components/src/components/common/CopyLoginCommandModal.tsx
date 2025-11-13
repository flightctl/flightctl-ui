import React from 'react';
import { Alert, CodeBlock, CodeBlockAction, CodeBlockCode, Modal, Stack, StackItem } from '@patternfly/react-core';
import { ModalBody, ModalHeader } from '@patternfly/react-core/next';

import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import { useAppContext } from '../../hooks/useAppContext';
import { getBrandName } from '../../utils/brand';
import CopyButton from './CopyButton';

const DEFAULT_API_URL = '<API-URL>';

/**
 * This modal is only shown when it's not possible to trigger an authentication flow to obtain a new token.
 * We show the command with the correct API URL and indicate how the user can obtain their token.
 *
 * Currently the modal only works in the OCP plugin, as it's the only option that has a /config endpoint
 */
const CopyLoginCommandModal = ({ onClose }: { onClose: VoidFunction }) => {
  const { t } = useTranslation();
  const { proxyFetch } = useFetch();
  const { settings } = useAppContext();
  const brandName = getBrandName(settings);

  const [serviceUrl, setServiceUrl] = React.useState('');
  const loginCommand = serviceUrl ? String.raw`flightctl login ${serviceUrl} --token=$(oc whoami -t)` : '';

  React.useEffect(() => {
    const loadServiceUrl = async () => {
      try {
        const configResp = await proxyFetch(`/config`, { credentials: 'include' });
        const config = (await configResp.json()) as { externalApiUrl: string };
        setServiceUrl(config.externalApiUrl);
      } catch (error) {
        // Shouldn't happen, but use the default API URL instead
        setServiceUrl(DEFAULT_API_URL);
      }
    };

    void loadServiceUrl();
  }, [proxyFetch]);

  return (
    <Modal variant="medium" onClose={onClose} isOpen>
      <ModalHeader title={t('{{ brandName }} CLI authentication', { brandName })} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            {t('Copy and run this command in your terminal to authenticate with {{ brandName }}:', { brandName })}
          </StackItem>
          <StackItem>
            <CodeBlock
              actions={
                loginCommand
                  ? [
                      <CodeBlockAction key="copy-command">
                        <CopyButton text={loginCommand} ariaLabel={t('Copy login command')} />
                      </CodeBlockAction>,
                    ]
                  : undefined
              }
            >
              <CodeBlockCode>{loginCommand || t('Loading...')}</CodeBlockCode>
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
      </ModalBody>
    </Modal>
  );
};

export default CopyLoginCommandModal;
