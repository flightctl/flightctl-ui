import * as React from 'react';
import { Formik } from 'formik';
import { Modal } from '@patternfly/react-core';
import { Device } from '@flightctl/types';

import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { getErrorMessage } from '../../../utils/error';
import { getStringListPatches } from '../../../utils/patch';
import { deviceSystemdUnitsValidationSchema } from '../../form/validations';
import TrackSystemdUnitsForm, { SystemdUnitFormValue, SystemdUnitsFormValues } from './TrackSystemdUnitsForm';

type SystemdUnitsModalProps = {
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
const SystemdUnitsModal: React.FC<SystemdUnitsModalProps> = ({ onClose, device }) => {
  const { t } = useTranslation();
  const { patch } = useFetch();
  const [error, setError] = React.useState<string>();

  const currentSystemdUnits: SystemdUnitFormValue[] = (device.spec?.systemd?.matchPatterns || []).map((p) => ({
    pattern: p,
    exists: true,
  }));
  return (
    <Modal title={t('Track systemd services')} isOpen onClose={() => onClose()} variant="small">
      <Formik<SystemdUnitsFormValues>
        validationSchema={deviceSystemdUnitsValidationSchema(t)}
        initialValues={{ systemdUnits: currentSystemdUnits }}
        onSubmit={async ({ systemdUnits: updatedSystemdUnits }) => {
          try {
            const patternPatchBuilder = (value: string[]) => ({
              matchPatterns: value,
            });
            const patches = getStringListPatches(
              '/spec/systemd',
              currentSystemdUnits.map((p) => p.pattern),
              updatedSystemdUnits.map((p) => p.pattern),
              patternPatchBuilder,
            );
            if (patches.length > 0) {
              await patch(`devices/${device.metadata.name}`, patches);
              onClose(true);
            } else {
              onClose(false);
            }
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      >
        <TrackSystemdUnitsForm onClose={onClose} error={error} />
      </Formik>
    </Modal>
  );
};

export default SystemdUnitsModal;
