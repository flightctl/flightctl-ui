import * as React from 'react';
import {
  Alert,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import { getErrorMessage } from '../../../../utils/error';
import { AddCatalogItemFormValues } from '../types';

export const reviewStepId = 'review';

const ReviewStep = ({ error, isEdit }: { error: unknown; isEdit?: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<AddCatalogItemFormValues>();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {isEdit ? t('Review and save') : t('Review and create')}
        </Title>
      </StackItem>
      <StackItem>
        <DescriptionList isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
            <DescriptionListDescription>{values.name}</DescriptionListDescription>
          </DescriptionListGroup>
          {values.displayName && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Display name')}</DescriptionListTerm>
              <DescriptionListDescription>{values.displayName}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
            <DescriptionListDescription>{values.type}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Reference URI')}</DescriptionListTerm>
            <DescriptionListDescription>{values.referenceUri}</DescriptionListDescription>
          </DescriptionListGroup>
          {values.artifacts.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Alternative artifacts')}</DescriptionListTerm>
              <DescriptionListDescription>
                {values.artifacts
                  .filter((a) => a.uri)
                  .map((a) => {
                    const parts = [a.type, a.name].filter(Boolean);
                    return parts.join(' - ');
                  })
                  .join('; ')}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.shortDescription && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Short description')}</DescriptionListTerm>
              <DescriptionListDescription>{values.shortDescription}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.provider && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Provider')}</DescriptionListTerm>
              <DescriptionListDescription>{values.provider}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.homepage && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Homepage')}</DescriptionListTerm>
              <DescriptionListDescription>{values.homepage}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.supportUrl && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Support URL')}</DescriptionListTerm>
              <DescriptionListDescription>{values.supportUrl}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.documentationUrl && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Documentation URL')}</DescriptionListTerm>
              <DescriptionListDescription>{values.documentationUrl}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.deprecated && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Deprecated')}</DescriptionListTerm>
              <DescriptionListDescription>{values.deprecationMessage}</DescriptionListDescription>
            </DescriptionListGroup>
          )}

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Versions')}</DescriptionListTerm>
            <DescriptionListDescription>{values.versions.map((v) => v.version).join(', ')}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
      {!!error && (
        <StackItem>
          <Alert
            isInline
            variant="danger"
            title={isEdit ? t('Failed to save catalog item') : t('Failed to create catalog item')}
          >
            {getErrorMessage(error)}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ReviewStep;
