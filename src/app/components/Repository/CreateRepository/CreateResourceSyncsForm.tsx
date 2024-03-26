import TextField from '@app/components/form/TextField';
import { Button, FormGroup, FormSection } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { FieldArray, useFormikContext } from 'formik';
import * as React from 'react';
import { RepositoryFormValues, ResourceSyncFormValue } from './types';
import WithHelperText from '@app/components/common/WithHelperText';

const CreateResourceSyncsForm = () => {
  const { values } = useFormikContext<RepositoryFormValues>();
  return (
    <FieldArray name="resourceSyncs">
      {({ remove, push }) => (
        <>
          {values.resourceSyncs.map((resourceSync, index) => (
            <FormSection key={index}>
              <FormGroup label="Resource sync name" isRequired>
                <TextField
                  name={`resourceSyncs[${index}].name`}
                  aria-label="Resource sync name"
                  value={resourceSync.name}
                  isDisabled={resourceSync.exists}
                />
              </FormGroup>
              <FormGroup
                label="Target revision"
                isRequired
                labelIcon={<WithHelperText popoverContent="Name of a branch or a tag." />}
              >
                <TextField
                  name={`resourceSyncs[${index}].targetRevision`}
                  aria-label="Target revision"
                  value={resourceSync.targetRevision}
                  helperText="For example: main"
                />
              </FormGroup>
              <FormGroup
                label="Path"
                isRequired
                labelIcon={
                  <WithHelperText popoverContent="Absolute path to the file or directory holding the resource definitions." />
                }
              >
                <TextField
                  name={`resourceSyncs[${index}].path`}
                  aria-label="Path"
                  value={resourceSync.path}
                  helperText="For example: /inverter-fleet/fleets/eu-west-prod-001/fleet.yaml"
                />
              </FormGroup>
              <FormGroup isInline>
                {values.resourceSyncs.length > 1 && (
                  <Button variant="link" icon={<MinusCircleIcon />} iconPosition="left" onClick={() => remove(index)}>
                    Remove resource sync
                  </Button>
                )}
              </FormGroup>
            </FormSection>
          ))}
          <div>
            <Button
              variant="link"
              icon={<PlusCircleIcon />}
              iconPosition="left"
              onClick={() => push({ name: '', path: '', targetRevision: '' } as ResourceSyncFormValue)}
            >
              Add resource sync
            </Button>
          </div>
        </>
      )}
    </FieldArray>
  );
};

export default CreateResourceSyncsForm;
