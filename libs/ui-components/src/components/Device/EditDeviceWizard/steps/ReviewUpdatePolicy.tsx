import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';

import { DisruptionBudgetForm, RolloutPolicyForm } from '../../../../types/deviceSpec';

import { useTranslation } from '../../../../hooks/useTranslation';
import LabelsView from '../../../common/LabelsView';

export const ReviewUpdateRolloutPolicy = ({ rolloutPolicy }: { rolloutPolicy: RolloutPolicyForm }) => {
  const { t } = useTranslation();

  return rolloutPolicy.isAdvanced
    ? t('{{ count }} batches have been defined', { count: rolloutPolicy.batches.length })
    : '-';
};

export const ReviewUpdateDisruptionBudget = ({ disruptionBudget }: { disruptionBudget: DisruptionBudgetForm }) => {
  const { t } = useTranslation();
  if (!disruptionBudget.isAdvanced) {
    return '-';
  }

  const groupBy = disruptionBudget.groupBy || [];
  const labels =
    groupBy.length === 0
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
};
