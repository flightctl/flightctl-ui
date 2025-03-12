import React from 'react';
import { Flex, FlexItem, Label, Stack, StackItem } from '@patternfly/react-core';

import { ApplicationFormSpec } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';

const ReviewApplications = ({ apps }: { apps: ApplicationFormSpec[] }) => {
  const { t } = useTranslation();
  if (apps.length === 0) {
    return '-';
  }

  return (
    <Stack hasGutter>
      {apps.map((app, index) => (
        <StackItem key={`${app.image}_${index}`}>
          <Flex>
            <FlexItem>
              {app.name || t('Unnamed')} ({app.image})
            </FlexItem>
            {app.variables.map((variable, index) => (
              <FlexItem key={`var-${variable.name}_${index}`}>
                <Label color="blue">
                  {variable.name}={variable.value}
                </Label>
              </FlexItem>
            ))}
          </Flex>
        </StackItem>
      ))}
    </Stack>
  );
};

export default ReviewApplications;
