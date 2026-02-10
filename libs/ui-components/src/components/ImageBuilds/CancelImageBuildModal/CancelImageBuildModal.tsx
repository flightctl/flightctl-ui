import * as React from 'react';
import {
  Alert,
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';

const CancelImageBuildModal = ({
  imageBuildId,
  onClose,
}: {
  imageBuildId: string;
  onClose: (confirmed?: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { post } = useFetch();

  const [error, setError] = React.useState<string>();
  const [isCancelling, setIsCancelling] = React.useState<boolean>(false);

  return (
    <Modal isOpen onClose={() => onClose()} variant="small">
      <ModalHeader title={t('Cancel and discard build?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Content>
              {t(
                'This will immediately stop the current process. All progress will be lost, and the associated data will be permanently deleted.',
              )}
            </Content>
          </StackItem>
          {error && (
            <StackItem>
              <Alert isInline variant="danger" title={t('Failed to cancel image build')}>
                {error}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant="danger"
          isDisabled={isCancelling}
          isLoading={isCancelling}
          onClick={async () => {
            setError(undefined);
            try {
              setIsCancelling(true);
              await post(`imagebuilds/${imageBuildId}/cancel`, {});
              onClose(true);
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setIsCancelling(false);
            }
          }}
        >
          {t('Cancel image build')}
        </Button>
        <Button key="dismiss" variant="link" onClick={() => onClose()} isDisabled={isCancelling}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CancelImageBuildModal;
