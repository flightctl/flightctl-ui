import * as React from 'react';
import { Button, Flex, FlexItem, Split, SplitItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { CatalogIcon } from '@patternfly/react-icons/dist/js/icons/catalog-icon';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';

import { type CatalogItemRefSpec } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import TextField from '../form/TextField';
import { type DeviceSpecConfigFormValues } from '../../types/deviceSpec';
import DeleteModal from '../modals/DeleteModal/DeleteModal';
import CatalogAddOsModal from '../CatalogComposition/CatalogAddOsModal';
import CatalogRefCard from './CatalogRefCard';

type OsCatalogRefFieldProps = {
  isReadOnly?: boolean;
  isOsPackageMode?: boolean;
  isEdit?: boolean;
  showUpdateStatus: boolean;
};

const CatalogRefField = ({
  refSpec,
  showUpdateStatus,
  isReadOnly,
  needsDeleteConfirm,
  onDelete,
}: {
  refSpec: CatalogItemRefSpec;
  showUpdateStatus: boolean;
  needsDeleteConfirm?: boolean;
  isReadOnly?: boolean;
  onDelete: VoidFunction;
}) => {
  const { t } = useTranslation();
  const [showRemoveConfirm, setShowRemoveConfirm] = React.useState(false);

  return (
    <>
      <Split hasGutter>
        <SplitItem isFilled>
          <CatalogRefCard catalogItemRef={refSpec} showUpdateStatus={showUpdateStatus} />
        </SplitItem>
        {!isReadOnly && (
          <SplitItem>
            <Button
              aria-label={t('Delete system image')}
              variant="link"
              isDanger
              icon={<MinusCircleIcon />}
              iconPosition="start"
              onClick={() => {
                if (needsDeleteConfirm) {
                  setShowRemoveConfirm(true);
                } else {
                  onDelete();
                }
              }}
            />
          </SplitItem>
        )}
      </Split>
      {showRemoveConfirm && (
        <DeleteModal
          onClose={() => setShowRemoveConfirm(false)}
          onDelete={() => {
            onDelete();
            setShowRemoveConfirm(false);
            return Promise.resolve();
          }}
          resourceType="os"
          confirmText={t(
            'This removes the system image from the template. You can add it again from the catalog or manually.',
          )}
        />
      )}
    </>
  );
};

const OsCatalogRefField = ({ isReadOnly, isOsPackageMode, isEdit, showUpdateStatus }: OsCatalogRefFieldProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<DeviceSpecConfigFormValues>();
  const [isCatalogSelectOpen, setIsCatalogSelectOpen] = React.useState(false);

  const clearOsSpec = () => {
    void setFieldValue('osSpec', { image: '' });
  };

  const catalogRef = values.osSpec?.catalogItemRef;
  if (catalogRef) {
    return (
      <CatalogRefField
        refSpec={catalogRef}
        showUpdateStatus={showUpdateStatus}
        isReadOnly={isReadOnly}
        needsDeleteConfirm={isEdit}
        onDelete={clearOsSpec}
      />
    );
  }

  const canUpdateOs = !isReadOnly && !isOsPackageMode;
  return (
    <>
      <Flex alignItems={{ default: 'alignItemsFlexStart' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
        <FlexItem flex={{ default: 'flex_1' }}>
          <TextField
            aria-label={t('System image')}
            name="osSpec.image"
            isDisabled={!canUpdateOs}
            helperText={t(
              'Must be a reference to a bootable container image (such as "quay.io/<my-org>/my-rhel-with-fc-agent:<version>"). If you do not want to manage your OS from Edge management, leave this field empty.',
            )}
          />
        </FlexItem>
        {canUpdateOs && (
          <FlexItem>
            <Button variant="secondary" icon={<CatalogIcon />} onClick={() => setIsCatalogSelectOpen(true)}>
              {t('Add from software catalog')}
            </Button>
          </FlexItem>
        )}
      </Flex>
      {isCatalogSelectOpen && (
        <CatalogAddOsModal
          onClose={() => setIsCatalogSelectOpen(false)}
          onConfirm={(selection) => {
            void setFieldValue('osSpec', { catalogItemRef: selection.catalogItemRef });
            setIsCatalogSelectOpen(false);
          }}
        />
      )}
    </>
  );
};

export default OsCatalogRefField;
