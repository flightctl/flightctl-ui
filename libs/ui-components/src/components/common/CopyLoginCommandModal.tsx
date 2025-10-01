import React from 'react';
import { CodeBlock, CodeBlockAction, CodeBlockCode, Modal } from '@patternfly/react-core';
import { ModalBody, ModalHeader } from '@patternfly/react-core/next';

import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import CopyButton from './CopyButton';

const DEFAULT_API_URL = '<API-URL>';

// CELIA-WIP STILL NEEDS TO BE TESTED IN THE OCP CLUSTER
/**
 * This modal is only shown when it's not possible to trigger an authentication flow to obtain a new token.
 * We show the command with the correct API URL and indicate how the user can obtain their token.
 *
 * Currently the modal only works in the OCP plugin, as it's the only option that has a /config endpoint
 */
const CopyLoginCommandModal = ({ onClose }: { onClose: VoidFunction }) => {
  const { t } = useTranslation();
  const { proxyFetch } = useFetch();

  const [serviceUrl, setServiceUrl] = React.useState('');
  const loginCommand = `flightctl login ${serviceUrl || DEFAULT_API_URL} --token=$(oc whoami -t)`;

  React.useEffect(() => {
    const loadServiceUrl = async () => {
      try {
        const configResp = await proxyFetch(`/config`, { credentials: 'include' });
        const config = (await configResp.json()) as { externalApiUrl: string };
        setServiceUrl(config.externalApiUrl);
      } catch (error) {
        // Ignore, we'll show the default API URL
      }
    };

    void loadServiceUrl();
  }, [proxyFetch]);

  return (
    <Modal variant="small" onClose={onClose} isOpen>
      <ModalHeader title={t('Copy login command')} />
      <ModalBody>
        <CodeBlock
          actions={[
            <CodeBlockAction key="copy-command">
              <CopyButton text={loginCommand} ariaLabel={t('Copy login command')} />
            </CodeBlockAction>,
          ]}
        >
          <CodeBlockCode>{loginCommand}</CodeBlockCode>
        </CodeBlock>
      </ModalBody>
    </Modal>
  );
};

export default CopyLoginCommandModal;
