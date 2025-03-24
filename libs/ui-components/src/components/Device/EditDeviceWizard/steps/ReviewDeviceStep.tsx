import * as React from 'react';
import { useFormikContext } from 'formik';
import {
  Alert,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { EditDeviceFormValues } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import LabelsView from '../../../common/LabelsView';
import { toAPILabel } from '../../../../utils/labels';
import { getErrorMessage } from '../../../../utils/error';
import FlightControlDescriptionList from '../../../common/FlightCtlDescriptionList';
import RepositorySourceList from '../../../Repository/RepositoryDetails/RepositorySourceList';
import { getApiConfig } from '../deviceSpecUtils';
import ReviewApplications from './ReviewApplications';

export const reviewDeviceStepId = 'review-device';

const ReviewStep = ({ error }: { error?: string }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<EditDeviceFormValues>();

  return (
    <Stack hasGutter>
      <StackItem isFilled>
        <FlightControlDescriptionList
          isHorizontal
          horizontalTermWidthModifier={{
            default: '25ch',
          }}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Alias')}</DescriptionListTerm>
            <DescriptionListDescription>{values.deviceAlias || t('Untitled')}</DescriptionListDescription>
          </DescriptionListGroup>
          {values.labels.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Device labels')}</DescriptionListTerm>
              <DescriptionListDescription>
                <LabelsView prefix="device" labels={toAPILabel(values.labels)} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {values.fleetMatch && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Device fleet')}</DescriptionListTerm>
              <DescriptionListDescription>{values.fleetMatch}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('System image')}</DescriptionListTerm>
            <DescriptionListDescription>
              {values.osImage || t(`Edge Manager will not manage system image`)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {values.configTemplates.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Configurations')}</DescriptionListTerm>
              <DescriptionListDescription>
                <RepositorySourceList configs={values.configTemplates.map(getApiConfig)} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.applications.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Applications')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ReviewApplications apps={values.applications} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </FlightControlDescriptionList>
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
