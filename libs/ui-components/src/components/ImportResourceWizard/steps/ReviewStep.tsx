import * as React from 'react';
import { Alert, FormGroup, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useFormikContext } from 'formik';

import { ImportResourceFormValues } from '../types';
import FlightCtlForm from '../../form/FlightCtlForm';
import { useTranslation } from '../../../hooks/useTranslation';

export const reviewStepId = 'review';

const ReviewStep = ({ errors, infoText }: { errors?: string[]; infoText?: string }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ImportResourceFormValues>();
  return (
    <Stack hasGutter>
      <StackItem isFilled>
        <FlightCtlForm>
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
        </FlightCtlForm>
      </StackItem>
      {infoText && (
        <StackItem>
          <Alert isInline variant="info" title={infoText} />
        </StackItem>
      )}
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
