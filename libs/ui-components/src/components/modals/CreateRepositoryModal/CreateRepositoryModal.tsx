import * as React from 'react';
import { Modal, ModalBody, ModalHeader } from '@patternfly/react-core';

import { Repository } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import CreateRepositoryForm, {
  CreateRepositoryFormProps,
} from '../../Repository/CreateRepository/CreateRepositoryForm';

type CreateRepositoryModalProps = {
  onClose: VoidFunction;
  onSuccess: (repository: Repository) => void;
  options?: CreateRepositoryFormProps['options'];
};

const CreateRepositoryModal = ({ options, onClose, onSuccess }: CreateRepositoryModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal variant="medium" isOpen>
      <ModalHeader title={t('Create repository')} />
      <ModalBody>
        <CreateRepositoryForm onClose={onClose} onSuccess={onSuccess} options={options} />
      </ModalBody>
    </Modal>
  );
};

export default CreateRepositoryModal;
