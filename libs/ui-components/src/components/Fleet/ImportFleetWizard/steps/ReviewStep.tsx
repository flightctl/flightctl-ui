import { Alert, Form, FormGroup, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import * as React from 'react';
import { ImportFleetFormValues } from '../types';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from '../../../../hooks/useTranslation';

export const reviewStepId = 'review';

const ReviewStep = ({ errors }: { errors?: string[] }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ImportFleetFormValues>();
  return (
    <Stack hasGutter>
      <StackItem isFilled>
        <Form>
          <FormGroup label={t('Repository')}>
            <TextInput
              value={values.useExistingRepo ? values.existingRepo : values.name}
              type="text"
              aria-label={t('disabled repository input')}
              isDisabled
            />
          </FormGroup>
          <FormGroup label={t('Resource syncs')}>
            <Table>
              <Thead>
                <Tr>
                  <Th>{t('Name')}</Th>
                  <Th>{t('Path')}</Th>
                  <Th>{t('Target revision')}</Th>
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
          title={t(
            'Fleets will appear in the fleets table list and their status will be reflecting the resource sync process status. After a few minutes, they should be synced and enabled.',
          )}
        />
      </StackItem>
      {errors?.length && (
        <StackItem>
          <Alert isInline variant="danger" title={t('An error occurred')}>
            {errors?.map((e, index) => <div key={index}>{e}</div>)}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ReviewStep;
