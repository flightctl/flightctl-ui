import * as React from 'react';
import { Icon, Popover, PopoverPosition } from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { ImageOrCatalogItemRefSpec } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSystemImage } from '../../Catalog/useSystemImage';

const DeviceOs = ({
  osSpec,
  renderedOsImage,
}: {
  osSpec?: ImageOrCatalogItemRefSpec;
  renderedOsImage: string | undefined;
}) => {
  const { t } = useTranslation();

  // CELIA-WIP: Restore the functioanlity from the Catalog.
  const { imageUri: desiredOsImage } = useSystemImage(osSpec);

  if (!desiredOsImage && !renderedOsImage) {
    return null;
  }

  return (
    <div>
      {renderedOsImage || t('Running system image is unknown')}
      {desiredOsImage && desiredOsImage !== renderedOsImage && (
        <Popover
          aria-label={t('System image mismatch')}
          position={PopoverPosition.top}
          headerContent={t('System image mismatch')}
          bodyContent={t('Desired system image: {{ desiredOsImage }}', { desiredOsImage })}
          withFocusTrap={false}
        >
          <>
            {' '}
            <Icon status="warning">
              <ExclamationTriangleIcon />
            </Icon>
          </>
        </Popover>
      )}
    </div>
  );
};

export default DeviceOs;