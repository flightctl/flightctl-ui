import { Modal } from '@patternfly/react-core';
import { Device } from '@types';
import { Formik } from 'formik';
import * as React from 'react';
import MatchPatternsForm, { MatchPatternsFormValues } from './MatchPatternsForm';
import { useFetch } from '@app/hooks/useFetch';
import { getErrorMessage } from '@app/utils/error';

type MatchPatternsModalProps = {
  onClose: (reload?: boolean) => void;
  device: Device;
};

const getDevice = (device: Device, matchPatterns: string[]) => {
  return {
    ...device,
    spec: {
      ...device.spec,
      systemd: {
        ...(device.spec.systemd || {}),
        matchPatterns,
      },
    },
  };
};

const MatchPatternsModal: React.FC<MatchPatternsModalProps> = ({ onClose, device }) => {
  const { put } = useFetch();
  const [error, setError] = React.useState<string>();
  return (
    <Modal title="Edit match patterns" isOpen onClose={() => onClose()} variant="small">
      <Formik<MatchPatternsFormValues>
        initialValues={{ matchPatterns: device.spec.systemd?.matchPatterns || [] }}
        onSubmit={async ({ matchPatterns }) => {
          try {
            await put(`devices/${device.metadata.name}`, getDevice(device, matchPatterns));
            onClose(true);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      >
        <MatchPatternsForm onClose={onClose} error={error} />
      </Formik>
    </Modal>
  );
};

export default MatchPatternsModal;
