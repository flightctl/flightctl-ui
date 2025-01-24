import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Grid, GridItem } from '@patternfly/react-core';

import { useTranslation } from '../../../../hooks/useTranslation';
import NumberField from '../../../form/NumberField';
import TextListField from '../../../form/TextListField';
import ErrorHelperText from '../../../form/FieldHelperText';
import WithHelperText from '../../../common/WithHelperText';
import { DisruptionBudgetForm } from '../types';

const UpdateStepDisruptionBudget = () => {
  const { t } = useTranslation();

  const [, meta] = useField<DisruptionBudgetForm>('disruptionBudget');

  return (
    <div className="pf-v5-u-mb-lg">
      <FormGroup
        label={
          <WithHelperText
            ariaLabel={t('Group devices by label keys')}
            content={t('The disruption budget will be applied to all group combinations independently.')}
            showLabel
          />
        }
      >
        <TextListField
          name="disruptionBudget.groupBy"
          addButtonText={t('Add label key')}
          helperText={t("Use only the 'key' part of the labels to group same values")}
        />
      </FormGroup>
      <Grid hasGutter>
        <GridItem md={6}>
          <FormGroup
            label={
              <WithHelperText
                ariaLabel={t('Minimum number of available devices')}
                content={t(
                  'At least this number of devices will be available at any given moment, for each group defined above.',
                )}
                showLabel
              />
            }
          >
            <NumberField
              aria-label={t('Minimum number of available devices')}
              name="disruptionBudget.minAvailable"
              min={1}
            />
          </FormGroup>
        </GridItem>
        <GridItem md={6}>
          <FormGroup
            label={
              <WithHelperText
                ariaLabel={t('Maximum number of unavailable devices')}
                content={t(
                  'No more than this number of devices will be unavailable at any given moment, for each group defined above.',
                )}
                showLabel
              />
            }
          >
            <NumberField
              aria-label={t('Maximum number of unavailable devices')}
              name="disruptionBudget.maxUnavailable"
              min={1}
            />
          </FormGroup>
        </GridItem>
        {/* Show error when both numberic values are unset */}
        {typeof meta.error === 'string' && (
          <GridItem md={12}>
            <ErrorHelperText meta={meta} />
          </GridItem>
        )}
      </Grid>
    </div>
  );
};

export default UpdateStepDisruptionBudget;
