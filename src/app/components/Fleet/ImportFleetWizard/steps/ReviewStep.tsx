import { Alert, Form, FormGroup, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import * as React from 'react';
import { ImportFleetFormValues } from '../types';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

export const reviewStepId = 'review';

const ReviewStep = ({ errors }: { errors?: string[] }) => {
  const { values } = useFormikContext<ImportFleetFormValues>();
  return (
    <Stack hasGutter>
      <StackItem isFilled>
        <Form>
          <FormGroup label="Repository">
            <TextInput
              value={values.useExistingRepo ? values.existingRepo : values.name}
              type="text"
              aria-label="disabled repository input"
              isDisabled
            />
          </FormGroup>
          <FormGroup label="Resource syncs">
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Path</Th>
                  <Th>Target revision</Th>
                </Tr>
              </Thead>
              <Tbody>
                {values.resourceSyncs.map((rs) => (
                  <Tr key={rs.name}>
                    <Td>{rs.name}</Td>
                    <Td>{rs.path}</Td>
                    <Td>{rs.targetRevision}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </FormGroup>
        </Form>
      </StackItem>
      <StackItem>
        <Alert
          isInline
          variant="info"
          title="Fleets will appear in the fleets table list and their status will be reflecting the resource sync process status. After a few minutes, they should be synced and enabled."
        />
      </StackItem>
      {errors?.length && (
        <StackItem>
          <Alert isInline variant="danger" title="An error occured.">
            {errors?.map((e, index) => <div key={index}>{e}</div>)}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ReviewStep;
