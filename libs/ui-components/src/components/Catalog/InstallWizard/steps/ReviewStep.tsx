import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import * as React from 'react';
import { useTranslation } from '../../../../hooks/useTranslation';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { InstallAppFormik, InstallOsFormik } from '../types';

const UpdateAlerts = () => {
  const { t } = useTranslation();
  const values = useFormikContext<InstallOsFormik | InstallAppFormik>().values;

  if (values.target === 'fleet') {
    if (!values.fleet?.spec.template.spec.os?.image) {
      return (
        <Alert isInline variant="warning" title={t('Fleet update')}>
          {t(
            'This will update the OS image for all (number) devices in the <name> fleet. Devices will download and apply the update according to the configured update policies.',
          )}
        </Alert>
      );
    } else {
      return (
        <Alert isInline variant="warning" title={t('Existing OS image detected')}>
          {t('')}
        </Alert>
      );
    }
  } else if (values.target === 'device') {
    if (!values.device?.spec?.os?.image) {
      return (
        <Alert isInline variant="warning" title={t('Device update')}>
          {t(
            'This will update the OS image. Devices will download and apply the update according to the configured update policies.',
          )}
        </Alert>
      );
    } else {
      return (
        <Alert isInline variant="warning" title={t('Existing OS image detected')}>
          {t('')}
        </Alert>
      );
    }
  }
  return false;
};

type ReviewStepProps = {
  isApp?: boolean;
  error?: string;
};

const ReviewStep = ({ error }: ReviewStepProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<InstallOsFormik | InstallAppFormik>();

  const targetLabel =
    values.target === 'fleet'
      ? values.fleet?.metadata.name
      : values.target === 'device'
        ? values.device?.metadata.name
        : values.target === 'new-device'
          ? t('New device')
          : '-';

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h3">{t('Review installation specifications')}</Title>
        </StackItem>
        <UpdateAlerts />
        <StackItem>
          <Card>
            <CardTitle>{t('Installation specifications')}</CardTitle>
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
        <StackItem>
          <Card>
            <CardTitle>{t('Target')}</CardTitle>
            <CardBody>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Target type')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {values.target === 'fleet'
                      ? t('Fleet')
                      : values.target === 'device'
                        ? t('Device')
                        : values.target === 'new-device'
                          ? t('New device')
                          : '-'}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Target')}</DescriptionListTerm>
                  <DescriptionListDescription>{targetLabel}</DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        </StackItem>
        {error && (
          <StackItem>
            <Alert variant="danger" title={t('Failed to install')} isInline>
              {error}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </FlightCtlForm>
  );
};

export default ReviewStep;
