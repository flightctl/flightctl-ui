import { Modal } from '@patternfly/react-core';
import { Device } from '@flightctl/types';
import { Formik } from 'formik';
import * as React from 'react';
import MatchPatternsForm, { MatchPatternsFormValues } from './MatchPatternsForm';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import { useTranslation } from '../../../hooks/useTranslation';
import { deviceSystemdUnitsValidationSchema } from '../../form/validations';

type MatchPatternsModalProps = {
  onClose: (reload?: boolean) => void;
  device: Device;
};

/**
 * Modal for editing the Systemd units matchPatterns of a Device.
 * This operation is only supported for devices that are NOT bound to fleets, in which case
 * the systemd units definition are defined in the `device.spec` itself, not via a templateVersion.

 * @param device FlightCtl device
 * @param onClose on close callback
 */
const MatchPatternsModal: React.FC<MatchPatternsModalProps> = ({ onClose, device }) => {
  const { t } = useTranslation();
  const { patch } = useFetch();
  const [error, setError] = React.useState<string>();
  return (
    <Modal title={t('Edit match patterns')} isOpen onClose={() => onClose()} variant="small">
      <Formik<MatchPatternsFormValues>
        validationSchema={deviceSystemdUnitsValidationSchema(t)}
        initialValues={{ matchPatterns: device.spec?.systemd?.matchPatterns || [] }}
        onSubmit={async () => {
          try {
            await patch(`devices/${device.metadata.name}`, []);
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
