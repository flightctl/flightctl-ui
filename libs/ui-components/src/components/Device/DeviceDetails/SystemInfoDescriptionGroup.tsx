import * as React from 'react';
import {
  Content,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { SystemInfoSourceStatusType } from '@flightctl/types';

import { type SystemInfoEntry } from '../../../hooks/useDeviceSystemInfo';
import { useTranslation } from '../../../hooks/useTranslation';
import LabelWithHelperText from '../../common/WithHelperText';

const hasDisplayValue = (value: React.ReactNode) => value !== undefined && value !== null && value !== '';

const SystemInfoValue = ({ entry }: { entry: SystemInfoEntry }) => {
  const { t } = useTranslation();
  const reporting = entry.reporting;
  const isFailed = reporting?.status === SystemInfoSourceStatusType.SystemInfoSourceStatusError;
  const isUnknown = reporting?.status === SystemInfoSourceStatusType.SystemInfoSourceStatusUnknown;

  return (
    <Stack>
      <StackItem>
        {hasDisplayValue(entry.value) ? entry.value : <Content component="small">{t('No value reported')}</Content>}
      </StackItem>
      {reporting?.timeSince && (
        <StackItem>
          <Content component="small">{t('Last changed {{time}}', { time: reporting.timeSince })}</Content>
        </StackItem>
      )}
      {isUnknown && (
        <StackItem>
          <Label isCompact>{t('Unknown')}</Label>
        </StackItem>
      )}
      {isFailed && (
        <StackItem>
          <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Label isCompact status="warning">
                {t('Stale')}
              </Label>
            </FlexItem>
            {reporting?.error && (
              <FlexItem>
                <LabelWithHelperText
                  hideLabel
                  label={t('Reported {{fieldName}} value is stale', { fieldName: entry.key })}
                  content={
                    <Stack hasGutter>
                      <StackItem>
                        {t(
                          'This is the last known value. It has not been refreshed within the expected reporting interval.',
                        )}
                      </StackItem>
                      <StackItem>
                        <details>
                          <summary>{t('Error details')}</summary>
                          {reporting.error}
                        </details>
                      </StackItem>
                    </Stack>
                  }
                />
              </FlexItem>
            )}
          </Flex>
        </StackItem>
      )}
    </Stack>
  );
};

const SystemInfoDescriptionGroup = ({ entry }: { entry: SystemInfoEntry }) => (
  <DescriptionListGroup key={entry.key}>
    <DescriptionListTerm>{entry.title}</DescriptionListTerm>
    <DescriptionListDescription>
      <SystemInfoValue entry={entry} />
    </DescriptionListDescription>
  </DescriptionListGroup>
);

export default SystemInfoDescriptionGroup;
