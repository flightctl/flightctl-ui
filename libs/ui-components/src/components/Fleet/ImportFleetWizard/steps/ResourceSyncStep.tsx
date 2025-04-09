import * as React from 'react';
import { Grid, Stack, StackItem, Text, TextContent } from '@patternfly/react-core';
import { FormikErrors } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import FlightControlForm from '../../../form/FlightCtlForm';
import CreateResourceSyncsForm from '../../../Repository/CreateRepository/CreateResourceSyncsForm';
import { ImportFleetFormValues } from '../types';

export const resourceSyncStepId = 'resource-sync';
export const isResourceSyncStepValid = (errors: FormikErrors<ImportFleetFormValues>) => {
  if (Array.isArray(errors.resourceSyncs)) {
    return !errors.resourceSyncs?.some((e) => !!e);
  }
  return !errors.resourceSyncs;
};

const ResourceSyncStep = () => {
  const { t } = useTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text>
            {t(
              'A resource sync is an automated Gitops method that helps manage your imported fleets by monitoring source repository changes and updating your fleet configuration accordingly.',
            )}
          </Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <FlightControlForm>
          <Grid span={8}>
            <CreateResourceSyncsForm />
          </Grid>
        </FlightControlForm>
      </StackItem>
    </Stack>
  );
};

export default ResourceSyncStep;
