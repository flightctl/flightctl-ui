import * as React from 'react';
import { Label, Popover, Stack, StackItem } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons';

import { useTranslation } from '../../hooks/useTranslation';
import LearnMoreLink from './LearnMoreLink';
import { TECH_PREVIEW_LEVEL_LINK } from '../../links';

const TechPreviewPopoverContent = () => {
  const { t } = useTranslation();

  return (
    <Stack>
      <StackItem>
        {t(
          'Technology preview features provide early access to upcoming product innovations, enabling you to test functionality and provide feedback during the development process.',
        )}
      </StackItem>
      <StackItem>
        <LearnMoreLink link={TECH_PREVIEW_LEVEL_LINK} />
      </StackItem>
    </Stack>
  );
};

const TechPreviewBadge = () => {
  const { t } = useTranslation();

  return (
    <Popover
      aria-label={t('Technology preview description')}
      bodyContent={<TechPreviewPopoverContent />}
      withFocusTrap
      triggerAction="click"
    >
      <Label color="orange" icon={<InfoCircleIcon />}>
        {t('Technology preview')}
      </Label>
    </Popover>
  );
};

export default TechPreviewBadge;
