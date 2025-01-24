import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';

import { DisruptionBudgetForm, RolloutPolicyForm } from '../../../Fleet/CreateFleet/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import LabelsView from '../../../common/LabelsView';

const ReviewUpdatePolicy = ({
  rolloutPolicy,
  disruptionBudget,
}: {
  rolloutPolicy?: RolloutPolicyForm;
  disruptionBudget?: DisruptionBudgetForm;
}) => {
  const { t } = useTranslation();

  if (rolloutPolicy?.isAdvanced) {
    return (
      <Stack hasGutter>
        <StackItem>{t('{{ count }} batches have been defined', { count: rolloutPolicy.batches.length })}</StackItem>
      </Stack>
    );
  }

  if (disruptionBudget?.isAdvanced) {
    const groupBy = disruptionBudget.groupBy;
    const labels =
      groupBy === undefined
        ? null
        : groupBy.reduce((acc, labelKey) => {
            acc[labelKey] = '';
            return acc;
          }, {});

    return (
      <Stack hasGutter>
        {labels ? (
          <StackItem>
            <LabelsView labels={labels} prefix="disruption" />
          </StackItem>
        ) : (
          t('Applies to all the fleet devices')
        )}

        {disruptionBudget.minAvailable && (
          <StackItem>
            {t('Minimum available devices: {{ minAvailable }}', { minAvailable: disruptionBudget.minAvailable })}
          </StackItem>
        )}
        {disruptionBudget.maxUnavailable && (
          <StackItem>
            {t('Maximum unavailable devices: {{ maxUnavailable }}', {
              maxUnavailable: disruptionBudget.maxUnavailable,
            })}
          </StackItem>
        )}
      </Stack>
    );
  }
  return '-';
};

export default ReviewUpdatePolicy;
