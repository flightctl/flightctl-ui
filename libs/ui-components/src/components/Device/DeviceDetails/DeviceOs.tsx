import * as React from 'react';
import { Icon, Popover, PopoverPosition, Stack, StackItem } from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import type { CatalogItemRefSpec, ImageOrCatalogItemRefSpec } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSystemImage } from '../EditDeviceWizard/useSystemImage';
import { SystemImageCatalogLabel } from '../EditDeviceWizard/SystemImageDescriptionGroup';
import { formatCatalogItemRef } from '../../../utils/catalog';

const RenderedOsImage = ({ isFromCatalog, image }: { isFromCatalog: boolean; image: string | undefined }) => {
  const { t } = useTranslation();

  const label = image || t('Running system image is unknown');

  return (
    <span>
      {label} {isFromCatalog && <SystemImageCatalogLabel />}
    </span>
  );
};

const DeviceOs = ({
  osSpec,
  renderedOsImage,
}: {
  osSpec: ImageOrCatalogItemRefSpec | undefined;
  renderedOsImage: string | undefined;
}) => {
  const { t } = useTranslation();

  const { imageUri: desiredOsImage, isLoading } = useSystemImage(osSpec);

  const hasCatalogRef = !!osSpec?.catalogItemRef;
  const hasDesiredOsImage = Boolean(desiredOsImage || hasCatalogRef);
  if (!hasDesiredOsImage && !renderedOsImage) {
    return null;
  }

  const desiredOsImageContent =
    desiredOsImage || (hasCatalogRef ? formatCatalogItemRef(osSpec?.catalogItemRef as CatalogItemRefSpec) : undefined);
  return (
    <div>
      <RenderedOsImage image={renderedOsImage} isFromCatalog={hasCatalogRef && renderedOsImage === desiredOsImage} />
      {hasDesiredOsImage && desiredOsImage !== renderedOsImage && !isLoading && (
        <Popover
          aria-label={t('System image mismatch')}
          headerContent={t('System image mismatch')}
          position={PopoverPosition.top}
          bodyContent={
            <Stack hasGutter>
              <StackItem>
                {t('Desired system image')}
                {hasCatalogRef && <SystemImageCatalogLabel />}
              </StackItem>
              <StackItem>{desiredOsImageContent}</StackItem>
            </Stack>
          }
          withFocusTrap={false}
        >
          <span className="pf-v6-u-ml-sm">
            <Icon status="warning">
              <ExclamationTriangleIcon />
            </Icon>
          </span>
        </Popover>
      )}
    </div>
  );
};

export default DeviceOs;
