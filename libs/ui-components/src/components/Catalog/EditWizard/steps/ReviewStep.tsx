import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  List,
  ListItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import * as React from 'react';

import { useTranslation } from '../../../../hooks/useTranslation';
import { InstallSpecFormik } from '../../InstallWizard/types';
import { useFormikContext } from 'formik';
import { RJSFValidationError } from '@rjsf/utils';

type ReviewStepProps = {
  error?: string;
  schemaErrors?: RJSFValidationError[];
  isEdit: boolean;
};

const ReviewStep = ({ error, schemaErrors, isEdit }: ReviewStepProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<InstallSpecFormik>();
  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h3">
          {isEdit ? t('Review update specifications') : t('Review deployment specifications')}
        </Title>
      </StackItem>
      <StackItem>
        <Card>
          <CardTitle>{isEdit ? t('Update specifications') : t('Deployment specifications')}</CardTitle>
          <CardBody>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Channel')}</DescriptionListTerm>
                <DescriptionListDescription>{values.channel}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Version')}</DescriptionListTerm>
                <DescriptionListDescription>{values.version}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>
      {error && (
        <StackItem>
          <Alert variant="danger" title={isEdit ? t('Failed to update') : t('Failed to deploy')} isInline>
            {error}
          </Alert>
        </StackItem>
      )}
      {!!schemaErrors?.length && (
        <StackItem>
          <Alert variant="danger" title={t('Configuration is not valid')} isInline>
            <List>
              {schemaErrors.map((e, index) => (
                <ListItem key={index}>
                  {e.property}: {e.message}
                </ListItem>
              ))}
            </List>
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ReviewStep;
