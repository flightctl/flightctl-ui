import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';

import { RolloutPolicyForm } from '../../../Fleet/CreateFleet/types';
import { useTranslation } from '../../../../hooks/useTranslation';

const ReviewUpdatePolicy = ({ rolloutPolicy }: { rolloutPolicy: RolloutPolicyForm }) => {
  const { t } = useTranslation();
  if (!rolloutPolicy.isActive) {
    return '-';
  }

  return (
    <Stack hasGutter>
      <StackItem>{t('{{ count }} batches have been defined', { count: rolloutPolicy.batches.length })}</StackItem>
    </Stack>
  );
};

export default ReviewUpdatePolicy;
