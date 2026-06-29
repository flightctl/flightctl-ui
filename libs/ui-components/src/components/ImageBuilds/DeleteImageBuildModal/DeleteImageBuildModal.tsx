import * as React from 'react';
import { Alert, Button, Content, ModalBody, ModalFooter, ModalHeader, Stack, StackItem } from '@patternfly/react-core';
import FlightCtlModal from '@flightctl/ui-components/src/components/common/FlightCtlModal';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';

const DeleteImageBuildModal = ({
  imageBuildId,
  onClose,
}: {
  imageBuildId: string;
  onClose: (hasDeleted?: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { remove } = useFetch();

  const [error, setError] = React.useState<string>();
  const [isDeleting, setIsDeleting] = React.useState<boolean>();

  return (
    <FlightCtlModal
      isOpen
      onClose={() => {
        onClose();
      }}
      variant="small"
    >
      <ModalHeader title={t('Delete this build?')} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Content>{t('This will remove the record of this build and its history.', { count: 1 })}</Content>
          </StackItem>
          <StackItem>
            <Content className="pf-v6-u-text-color-subtle">
              {t('The actual image files in your storage will not be deleted.')}
            </Content>
          </StackItem>
          {error && (
            <StackItem>
              <Alert isInline variant="danger" title={t('Deletion of image build failed.')}>
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
          isDisabled={isDeleting}
          isLoading={isDeleting}
          onClick={async () => {
            setError(undefined);
            try {
              setIsDeleting(true);
              await remove(`imagebuilds/${imageBuildId}`);
              setIsDeleting(false);
              onClose(true);
            } catch (imageBuildErr) {
              setError(getErrorMessage(imageBuildErr));
              setIsDeleting(false);
            }
          }}
        >
          {t('Delete')}
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            onClose();
          }}
          isDisabled={isDeleting}
        >
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </FlightCtlModal>
  );
};

export default DeleteImageBuildModal;
