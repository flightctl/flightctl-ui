import * as React from 'react';
import { Content, Stack, StackItem } from '@patternfly/react-core';
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
          <CreateResourceSyncsForm showSyncType={false} defaultSyncType={defaultSyncType} />
        </FlightControlForm>
      </StackItem>
    </Stack>
  );
};

export default ResourceSyncStep;
