import * as React from 'react';
import { Content, Grid, Stack, StackItem } from '@patternfly/react-core';
import { FormikErrors } from 'formik';
import { ResourceSyncType } from '@flightctl/types';

import FlightControlForm from '../../form/FlightCtlForm';
import CreateResourceSyncsForm from '../../Repository/CreateRepository/CreateResourceSyncsForm';
import { ImportResourceFormValues } from '../types';

export const resourceSyncStepId = 'resource-sync';
export const isResourceSyncStepValid = (errors: FormikErrors<ImportResourceFormValues>) => {
  if (Array.isArray(errors.resourceSyncs)) {
    return !errors.resourceSyncs?.some((e) => !!e);
  }
  return !errors.resourceSyncs;
};

const ResourceSyncStep = ({
  description,
  defaultSyncType,
}: {
  description: string;
  defaultSyncType: ResourceSyncType;
}) => {
  return (
    <Stack hasGutter>
      <StackItem>
        <Content component="p">{description}</Content>
      </StackItem>
      <StackItem>
        <FlightControlForm>
          <Grid span={8}>
            <CreateResourceSyncsForm showSyncType={false} defaultSyncType={defaultSyncType} />
          </Grid>
        </FlightControlForm>
      </StackItem>
    </Stack>
  );
};

export default ResourceSyncStep;
