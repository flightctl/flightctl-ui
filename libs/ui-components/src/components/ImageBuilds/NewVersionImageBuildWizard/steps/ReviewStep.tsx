import * as React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { ImageBuild } from '@flightctl/types/imagebuilder';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getImageReference } from '../../../../utils/imageBuilds';
import { useOciRegistriesContext } from '../../OciRegistriesContext';
import ImageUrl from '../../ImageUrl';
import { NewVersionWizardFormValues } from '../types';
import { ImageBuildWizardError } from '../../CreateImageBuildWizard/types';
import { ErrorAlert, SoftwareCatalogReviewCard } from '../../ReviewCommon';

export { SoftwareCatalogReviewCard };

export const reviewStepId = 'review';

type ReviewStepProps = {
  imageBuild: ImageBuild;
  error?: ImageBuildWizardError;
};

const ReviewStep = ({ imageBuild, error }: ReviewStepProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<NewVersionWizardFormValues>();
  const { ociRegistries } = useOciRegistriesContext();

  const dstImageReference = React.useMemo(
    () =>
      getImageReference(ociRegistries, {
        repository: imageBuild.spec.destination.repository,
        imageName: imageBuild.spec.destination.imageName,
        imageTag: values.destinationImageTag,
      }),
    [ociRegistries, imageBuild.spec.destination, values.destinationImageTag],
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <Card>
          <CardTitle>{t('New version details')}</CardTitle>
          <CardBody>
            <DescriptionList isHorizontal isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Build name')}</DescriptionListTerm>
                <DescriptionListDescription>{values.buildName}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Base image tag')}</DescriptionListTerm>
                <DescriptionListDescription>{values.sourceImageTag || t('(unchanged)')}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Output image tag')}</DescriptionListTerm>
                <DescriptionListDescription>{values.destinationImageTag}</DescriptionListDescription>
              </DescriptionListGroup>
              {dstImageReference && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Image output reference URL')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ImageUrl imageReference={dstImageReference} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>
      <SoftwareCatalogReviewCard />
      {error && <ErrorAlert error={error} />}
    </Stack>
  );
};

export default ReviewStep;
