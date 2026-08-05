import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateStatus,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { useFormikContext } from 'formik';

import { TargetPickerFormik } from './types';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useTranslation } from '../../../hooks/useTranslation';

type UpdateSuccessPageContentProps = React.PropsWithChildren<{
  isDevice: boolean;
  isSpecUnchanged: boolean;
}>;

export const UpdateSuccessPageContent = ({ isDevice, isSpecUnchanged, children }: UpdateSuccessPageContentProps) => {
  const { t } = useTranslation();
  if (isSpecUnchanged) {
    return (
      <EmptyState status={EmptyStateStatus.info} titleText={t('No action performed')}>
        <EmptyStateBody>
          {t('The selection from the catalog matches the current target spec, so no update was performed.')}
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>{children}</EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    );
  }
  return (
    <EmptyState status={EmptyStateStatus.success} titleText={t('Update configuration successful')}>
      <EmptyStateBody>
        {isDevice
          ? t('Device will download and apply the update according to the configured update policies.')
          : t('Devices will download and apply the update according to the configured update policies.')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>{children}</EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

const UpdateSuccessPage = ({ isSpecUnchanged }: { isSpecUnchanged: boolean }) => {
  const { t } = useTranslation();
  const {
    values: { target, device, fleet },
  } = useFormikContext<TargetPickerFormik>();
  const navigate = useNavigate();
  return (
    <UpdateSuccessPageContent isDevice={target === 'device'} isSpecUnchanged={isSpecUnchanged}>
      <Stack hasGutter>
        <StackItem>
          <Button
            variant="primary"
            onClick={() => {
              navigate(ROUTE.CATALOG);
            }}
          >
            {t('Return to catalog')}
          </Button>
        </StackItem>
        <StackItem>
          <Button
            variant="link"
            onClick={() => {
              if (target === 'device' && device) {
                navigate({ route: ROUTE.DEVICE_DETAILS, postfix: device.metadata.name });
                return;
              }
              if (target === 'fleet' && fleet) {
                navigate({ route: ROUTE.FLEET_DETAILS, postfix: fleet.metadata.name });
                return;
              }
              navigate(ROUTE.CATALOG);
            }}
          >
            {target === 'device' ? t('View device') : t('View fleet')}
          </Button>
        </StackItem>
      </Stack>
    </UpdateSuccessPageContent>
  );
};

export default UpdateSuccessPage;
