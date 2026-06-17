import * as React from 'react';
import { Trans } from 'react-i18next';
import { Alert, Button, ModalBody, ModalFooter, ModalHeader, Stack, StackItem } from '@patternfly/react-core';
import FlightCtlModal from '@flightctl/ui-components/src/components/common/FlightCtlModal';

import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/error';
import { ImagePromotion } from '@flightctl/types/imagebuilder';

const DeleteImagePromotionModal = ({
  promotion,
  onClose,
}: {
  promotion: ImagePromotion;
  onClose: (hasDeleted?: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { remove } = useFetch();

  const [error, setError] = React.useState<unknown>();
  const [isDeleting, setIsDeleting] = React.useState<boolean>();

  return (
    <FlightCtlModal isOpen onClose={() => onClose()} variant="small">
      <ModalHeader title={t('Delete image promotion?')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Trans t={t}>
              <strong>{promotion.metadata.name}</strong> will be deleted permanently.
            </Trans>
          </StackItem>
          {promotion.status?.publishedAt && <StackItem>{t('The existing catalog item will be unaffected.')}</StackItem>}
          <StackItem>{t('Are you sure you want to delete?')}</StackItem>
          {!!error && (
            <StackItem>
              <Alert isInline variant="danger" title={t('Failed to delete Image promotion')}>
                {getErrorMessage(error)}
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
            setIsDeleting(true);
            try {
              await remove(`imagepromotions/${promotion.metadata.name}`);
              onClose(true);
            } catch (err) {
              setError(err);
            } finally {
              setIsDeleting(false);
            }
          }}
        >
          {t('Delete image promotion')}
        </Button>
        <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isDeleting}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </FlightCtlModal>
  );
};

export default DeleteImagePromotionModal;
