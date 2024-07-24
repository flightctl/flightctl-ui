import * as React from 'react';
import { Modal } from '@patternfly/react-core';

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
    <Modal variant="medium" isOpen title={t('Create repository')} showClose={false}>
      <CreateRepositoryForm onClose={onClose} onSuccess={onSuccess} options={options} />
    </Modal>
  );
};

export default CreateRepositoryModal;
