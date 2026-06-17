import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { ModalProps, Modal as PFModal } from '@patternfly/react-core';
export type { ModalProps } from '@patternfly/react-core';

import { FLIGHTCTL_APP_CLASS } from '../../constants';

/**
 * Wrapper for modals that adds the "fctl-app" class.
 * Since modals are portaled outside the app root, the "fctl-app" class is needed to apply global styles.
 */
const FlightCtlModal = ({ className, ...props }: Omit<ModalProps, 'ref'>) => (
  <PFModal {...props} className={`${FLIGHTCTL_APP_CLASS}${className ? ` ${className}` : ''}`} />
);

export default FlightCtlModal;
