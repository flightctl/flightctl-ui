import * as React from 'react';
import { useFormikContext } from 'formik';
import {
  Alert,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { EditDeviceFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import LabelsView from '../../../common/LabelsView';
import { toAPILabel } from '../../../../utils/labels';
import { getSourceItems } from '../../../../utils/devices';
import { getErrorMessage } from '../../../../utils/error';
import RepositorySourceList from '../../../Repository/RepositoryDetails/RepositorySourceList';
import { getAPIConfig } from '../deviceSpecUtils';

export const reviewDeviceStepId = 'review-device';

const ReviewStep = ({ error }: { error?: string }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<EditDeviceFormValues>();
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
            <DescriptionListTerm>{t('Display name')}</DescriptionListTerm>
            <DescriptionListDescription>{values.displayName || t('Untitled')}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Device labels')}</DescriptionListTerm>
            <DescriptionListDescription>
              <LabelsView prefix="device" labels={toAPILabel(values.labels)} />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('System image')}</DescriptionListTerm>
            <DescriptionListDescription>
              {values.osImage || t(`Flight Control will not manage system image`)}
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
