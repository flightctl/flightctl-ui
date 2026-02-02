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

const UpdateSuccessPage = () => {
  const { t } = useTranslation();
  const {
    values: { target, device, fleet },
  } = useFormikContext<TargetPickerFormik>();
  const navigate = useNavigate();
  return (
    <EmptyState status={EmptyStateStatus.success} titleText={t('Update configuration successful')}>
      <EmptyStateBody>
        {t('Devices will download and apply the update according to the configured update policies.')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
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
                  navigate(
                    target === 'device'
                      ? { route: ROUTE.DEVICE_DETAILS, postfix: device?.metadata.name }
                      : { route: ROUTE.FLEET_DETAILS, postfix: fleet?.metadata.name },
                  );
                }}
              >
                {target === 'device' ? t('View device') : t('View fleet')}
              </Button>
            </StackItem>
          </Stack>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default UpdateSuccessPage;
