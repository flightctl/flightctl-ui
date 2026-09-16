import * as React from 'react';
import { Content, Stack, StackItem } from '@patternfly/react-core';

import { type DeltaGenerationForm } from '../../../types/deviceSpec';
import { useTranslation } from '../../../hooks/useTranslation';

type DeltaGenerationSummaryProps = {
  deltaGeneration: DeltaGenerationForm;
};

const DeltaGenerationSummary = ({ deltaGeneration }: DeltaGenerationSummaryProps) => {
  const { t } = useTranslation();

  if (!deltaGeneration.generateDelta) {
    return <Content>{t('Disabled for this fleet')}</Content>;
  }
  if (!deltaGeneration.isCustomized) {
    return <Content>{t('Enabled (deployment defaults)')}</Content>;
  }

  return (
    <Stack>
      <StackItem>{t('Enabled (custom timing)')}</StackItem>
      {deltaGeneration.maxWaitForDelta && (
        <StackItem>
          {t('Rollout hold deadline')}: {deltaGeneration.maxWaitForDelta}
        </StackItem>
      )}
      {deltaGeneration.deltaGenerationTimeout && (
        <StackItem>
          {t('Per-job timeout')}: {deltaGeneration.deltaGenerationTimeout}
        </StackItem>
      )}
    </Stack>
  );
};

export default DeltaGenerationSummary;
