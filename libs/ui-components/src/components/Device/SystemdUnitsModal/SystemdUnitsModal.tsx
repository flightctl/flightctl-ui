import * as React from 'react';
import { Formik } from 'formik';
import {
  Modal /* data-codemods */,
  ModalBody /* data-codemods */,
  ModalHeader /* data-codemods */,
} from '@patternfly/react-core';
import { Device } from '@flightctl/types';

import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { getErrorMessage } from '../../../utils/error';
import { getStringListPatches } from '../../../utils/patch';
import { deviceSystemdUnitsValidationSchema } from '../../form/validations';
import TrackSystemdUnitsForm, { SystemdUnitsFormValues } from './TrackSystemdUnitsForm';

type SystemdUnitsModalProps = {
  onClose: (hasChanges?: boolean, addedSystemdUnits?: string[]) => void;
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
  const currentSystemdUnits: SystemdUnitsFormValues['systemdUnits'] = (device.spec?.systemd?.matchPatterns || []).map(
    (p) => ({
      pattern: p,
      exists: true,
    }),
  );

  return (
    <Modal isOpen onClose={() => onClose()} variant="small">
      <ModalHeader title={t('Track systemd services')} />
      <ModalBody>
        <Formik<SystemdUnitsFormValues>
          validationSchema={deviceSystemdUnitsValidationSchema(t)}
          initialValues={{ systemdUnits: currentSystemdUnits }}
          onSubmit={async ({ systemdUnits: updatedSystemdUnits }) => {
            try {
              const currentPatterns = currentSystemdUnits.map((p) => p.pattern);
              const updatedPatterns = updatedSystemdUnits.map((p) => p.pattern);

              const patches = getStringListPatches(
                '/spec/systemd',
                currentPatterns,
                updatedPatterns,
                (value: string[]) => ({
                  matchPatterns: value,
                }),
              );
              if (patches.length > 0) {
                await patch(`devices/${device.metadata.name}`, patches);

                const addedServices: string[] = [];
                updatedPatterns.forEach((newSystemd) => {
                  if (!currentPatterns.includes(newSystemd)) {
                    addedServices.push(newSystemd);
                  }
                });

                onClose(true, addedServices);
              } else {
                onClose();
              }
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }}
        >
          <TrackSystemdUnitsForm onClose={onClose} error={error} />
        </Formik>
      </ModalBody>
    </Modal>
  );
};

export default SystemdUnitsModal;
