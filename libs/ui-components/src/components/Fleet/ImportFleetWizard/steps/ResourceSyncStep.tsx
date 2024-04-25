import * as React from 'react';
import { Form, Stack, StackItem, Text, TextContent } from '@patternfly/react-core';
import { FormikErrors } from 'formik';
import { useTranslation } from '../../../../hooks/useTranslation';

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
              "A resource sync is an automated Gitops way to manage imported fleets. The resource sync monitors changes made to the source repository and update the fleet's configurations accordingly.",
            )}
          </Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <Form>
          <CreateResourceSyncsForm />
        </Form>
      </StackItem>
    </Stack>
  );
};

export default ResourceSyncStep;
