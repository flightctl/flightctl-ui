import * as React from 'react';
import { Icon, Popover, PopoverPosition } from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { useTranslation } from '../../../hooks/useTranslation';

const DeviceOs = ({
  desiredOsImage,
  renderedOsImage,
}: {
  desiredOsImage: string | undefined;
  renderedOsImage: string | undefined;
}) => {
  const hasDiff = desiredOsImage && desiredOsImage !== renderedOsImage;
  const { t } = useTranslation();
  let popover: React.ReactNode;
  if (hasDiff) {
    popover = (
      <Popover
        aria-label={t('System image mismatch')}
        position={PopoverPosition.top}
        headerContent={t('System image mismatch')}
        bodyContent={t('Desired system image: {{ desiredOsImage }}', { desiredOsImage: desiredOsImage })}
        withFocusTrap={false}
      >
        <>
          {' '}
          <Icon status="warning">
            <ExclamationTriangleIcon />
          </Icon>
        </>
      </Popover>
    );
  }
  return (
    <div>
      {renderedOsImage || '-'}
      {popover}
    </div>
  );
};

export default DeviceOs;
