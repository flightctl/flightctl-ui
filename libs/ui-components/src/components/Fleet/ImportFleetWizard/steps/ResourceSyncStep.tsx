import CreateResourceSyncsForm from '../../../Repository/CreateRepository/CreateResourceSyncsForm';
import { Form } from '@patternfly/react-core';
import * as React from 'react';
import { ImportFleetFormValues } from '../types';
import { FormikErrors } from 'formik';

export const resourceSyncStepId = 'resource-sync';
export const isResourceSyncStepValid = (errors: FormikErrors<ImportFleetFormValues>) => {
  if (Array.isArray(errors.resourceSyncs)) {
    return !errors.resourceSyncs?.some((e) => !!e);
  }
  return !errors.resourceSyncs;
};

const ResourceSyncStep = () => (
  <Form>
    <CreateResourceSyncsForm />
  </Form>
);

export default ResourceSyncStep;
