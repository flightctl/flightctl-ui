import {
  Alert,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFormikContext } from 'formik';
import { FleetFormValues } from '../types';
import LabelsView from '../../../common/LabelsView';
import { toAPILabel } from '../../../../utils/labels';
import RepositorySourceList from '../../../Repository/RepositoryDetails/RepositorySourceList';
import { getErrorMessage } from '../../../../utils/error';
import { getSourceItems } from '../../../../utils/devices';
import { getAPIConfig } from '../../../Device/EditDeviceWizard/deviceSpecUtils';

export const reviewStepId = 'review';

const ReviewStep = ({ error }: { error?: unknown }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<FleetFormValues>();
  return (
    <Stack hasGutter>
      <StackItem isFilled>
        <DescriptionList
          isHorizontal
          horizontalTermWidthModifier={{
            default: '25ch',
          }}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
            <DescriptionListDescription>{values.name}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Fleet labels')}</DescriptionListTerm>
            <DescriptionListDescription>
              <LabelsView prefix="fleet" labels={toAPILabel(values.fleetLabels)} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Device selector')}</DescriptionListTerm>
            <DescriptionListDescription>
              <LabelsView prefix="device" labels={toAPILabel(values.labels)} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('System image')}</DescriptionListTerm>
            <DescriptionListDescription>
              {values.osImage || t(`The fleet will not manage system image`)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Configurations/applications')}</DescriptionListTerm>
            <DescriptionListDescription>
              <RepositorySourceList sourceItems={getSourceItems(values.configTemplates.map(getAPIConfig))} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
      {!!error && (
        <StackItem>
          <Alert isInline variant="danger" title={t('An error occurred')}>
            {getErrorMessage(error)}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ReviewStep;
