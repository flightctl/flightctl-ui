import * as React from 'react';
import { Modal, ModalBody, ModalHeader } from '@patternfly/react-core';

import { RepoSpecType, Repository } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import CreateRepositoryForm from '../../Repository/CreateRepository/CreateRepositoryForm';

type CreateRepositoryModalProps = {
  type: RepoSpecType;
  onClose: VoidFunction;
  onSuccess: (repository: Repository) => void;
};

const CreateRepositoryModal = ({ type, onClose, onSuccess }: CreateRepositoryModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal variant="medium" isOpen>
      <ModalHeader title={t('Create repository')} />
      <ModalBody>
        <CreateRepositoryForm
          onClose={onClose}
          onSuccess={onSuccess}
          options={{
            canUseResourceSyncs: false,
            allowedRepoTypes: [type],
          }}
        />
      </ModalBody>
    </Modal>
  );
};

export default CreateRepositoryModal;
