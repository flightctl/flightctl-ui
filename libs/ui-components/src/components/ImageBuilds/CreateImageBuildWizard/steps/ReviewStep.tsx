import * as React from 'react';
import { Trans } from 'react-i18next';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Icon,
  Label,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';

import { BindingType } from '@flightctl/types/imagebuilder';
import { useTranslation } from '../../../../hooks/useTranslation';
import { ImageBuildFormValues, ImageBuildWizardError } from '../types';
import { getImageReference } from '../../../../utils/imageBuilds';
import { getExportFormatLabel } from '../../../../utils/imageBuilds';
import { CERTIFICATE_VALIDITY_IN_YEARS } from '../../../../constants';
import { useOciRegistriesContext } from '../../OciRegistriesContext';
import ImageUrl from '../../ImageUrl';
import { ErrorAlert, SoftwareCatalogReviewCard } from '../../ReviewCommon';

export { ErrorAlert };

export const reviewStepId = 'review';

type ReviewStepProps = {
  error?: ImageBuildWizardError;
};

const ReviewStep = ({ error }: ReviewStepProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ImageBuildFormValues>();
  const { ociRegistries } = useOciRegistriesContext();

  const srcImageReference = React.useMemo(
    () => getImageReference(ociRegistries, values.source),
    [ociRegistries, values.source],
  );

  const dstImageReference = React.useMemo(
    () => getImageReference(ociRegistries, values.destination),
    [ociRegistries, values.destination],
  );

  const isEarlyBinding = values.bindingType === BindingType.BindingTypeEarly;
  const remoteAccessUsername = values.remoteAccessEnabled ? values.userConfiguration.username || '' : '';

  return (
    <Stack hasGutter>
      <StackItem>
        <Card>
          <CardTitle>{t('Base image')}</CardTitle>
          <CardBody>
            <DescriptionList isHorizontal isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Build name')}</DescriptionListTerm>
                <DescriptionListDescription>{values.buildName}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Source repository')}</DescriptionListTerm>
                <DescriptionListDescription>{values.source.repository}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Image name')}</DescriptionListTerm>
                <DescriptionListDescription>{values.source.imageName}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Image tag')}</DescriptionListTerm>
                <DescriptionListDescription>{values.source.imageTag}</DescriptionListDescription>
              </DescriptionListGroup>
              {srcImageReference && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Image reference URL')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ImageUrl imageReference={srcImageReference} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>
      <StackItem>
        <Card>
          <CardTitle>{t('Image output')}</CardTitle>
          <CardBody>
            <DescriptionList isHorizontal isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Target repository')}</DescriptionListTerm>
                <DescriptionListDescription>{values.destination.repository}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Image output name')}</DescriptionListTerm>
                <DescriptionListDescription>{values.destination.imageName}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Image output tag')}</DescriptionListTerm>
                <DescriptionListDescription>{values.destination.imageTag}</DescriptionListDescription>
              </DescriptionListGroup>
              {dstImageReference && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Image output reference URL')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ImageUrl imageReference={dstImageReference} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Export formats')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {values.exportFormats.length > 0 ? (
                    <>
                      {values.exportFormats.map((format) => (
                        <Label key={format} color="blue" className="pf-v6-u-mr-sm">
                          {getExportFormatLabel(t, format)}
                        </Label>
                      ))}
                    </>
                  ) : (
                    t('None')
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>
      <StackItem>
        <Card>
          <CardTitle>{t('Registration')}</CardTitle>
          <CardBody>
            <DescriptionList isHorizontal isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Binding type')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {isEarlyBinding ? t('Early binding') : t('Late binding')}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {isEarlyBinding ? (
                <>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Enrollment')}</DescriptionListTerm>
                    <DescriptionListDescription>{t('Auto-create certificate')}</DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Registration')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {t('{{ validityPeriod }} years (Standard)', {
                        validityPeriod: CERTIFICATE_VALIDITY_IN_YEARS,
                        count: CERTIFICATE_VALIDITY_IN_YEARS,
                      })}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </>
              ) : (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Registration')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Flex>
                      <FlexItem>
                        <Icon status="info" size="sm">
                          <InfoCircleIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>{t('Cloud-init and ignition are enabled automatically')}</FlexItem>
                    </Flex>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {remoteAccessUsername && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Remote access')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Trans t={t}>
                      Enabled for <strong>{remoteAccessUsername}</strong>
                    </Trans>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>
      <SoftwareCatalogReviewCard />
      {!!error && (
        <StackItem>
          <ErrorAlert error={error} />
        </StackItem>
      )}
    </Stack>
  );
};

export default ReviewStep;
