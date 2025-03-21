import * as React from 'react';
import { useField } from 'formik';
import { Flex, FlexItem, FormGroup, Stack, StackItem } from '@patternfly/react-core';

import { useTranslation } from '../../../../hooks/useTranslation';
import NumberField from '../../../form/NumberField';
import TextListField from '../../../form/TextListField';
import ErrorHelperText from '../../../form/FieldHelperText';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import { DisruptionBudgetForm } from '../../../../types/deviceSpec';

const UpdateStepDisruptionBudget = () => {
  const { t } = useTranslation();

  const [, meta] = useField<DisruptionBudgetForm>('disruptionBudget');

  return (
    <>
      <FormGroupWithHelperText
        label={t('Group devices by label keys')}
        content={t('The disruption budget will be applied to all group combinations independently.')}
      >
        <TextListField
          name="disruptionBudget.groupBy"
          addButtonText={t('Add label key')}
          helperText={
            <Stack>
              <StackItem>{t("Use only the 'key' part of the labels to group same values.")}</StackItem>
              <StackItem>{t("Leaving this empty will apply the disruption budget to all fleet's devices.")}</StackItem>
            </Stack>
          }
        />
      </FormGroupWithHelperText>
      <FormGroup>
        <Flex>
          <FlexItem>
            <FormGroupWithHelperText
              label={t('Minimum number of available devices')}
              content={t(
                'At least this number of devices will be available at any given moment, for each group defined above.',
              )}
            >
              <NumberField
                aria-label={t('Minimum number of available devices')}
                name="disruptionBudget.minAvailable"
                min={1}
              />
            </FormGroupWithHelperText>
          </FlexItem>
          <FlexItem>
            <FormGroupWithHelperText
              label={t('Maximum number of unavailable devices')}
              content={t(
                'No more than this number of devices will be unavailable at any given moment, for each group defined above.',
              )}
            >
              <NumberField
                aria-label={t('Maximum number of unavailable devices')}
                name="disruptionBudget.maxUnavailable"
                min={1}
              />
            </FormGroupWithHelperText>
          </FlexItem>
          {/* Show error when both numeric values are unset */}
          {typeof meta.error === 'string' && <ErrorHelperText meta={meta} />}
        </Flex>
      </FormGroup>
    </>
  );
};

export default UpdateStepDisruptionBudget;
