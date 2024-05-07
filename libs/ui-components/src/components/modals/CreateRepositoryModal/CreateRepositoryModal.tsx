import { Modal } from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import CreateRepositoryForm from '../../Repository/CreateRepository/CreateRepositoryForm';
import { Repository } from '@flightctl/types';

type CreateRepositoryModalProps = {
  onClose: VoidFunction;
  onSuccess: (repository: Repository) => void;
};

const CreateRepositoryModal: React.FC<CreateRepositoryModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  return (
    <Modal variant="medium" isOpen title={t('Create repository')} showClose={false}>
      <CreateRepositoryForm onClose={onClose} onSuccess={onSuccess} hideResourceSyncs />
    </Modal>
  );
};

export default CreateRepositoryModal;
