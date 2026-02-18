import * as React from 'react';
import { FormGroup, FormSection, Grid } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { RepoSpecType } from '@flightctl/types';
import { ImageBuildFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import FlightCtlForm from '../../../form/FlightCtlForm';
import NameField from '../../../form/NameField';
import TextField from '../../../form/TextField';
import RepositorySelect from '../../../form/RepositorySelect';
import { usePermissionsContext } from '../../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../../types/rbac';
import { getImageReference } from '../../../../utils/imageBuilds';
import ImageUrlCard from '../../ImageUrlCard';
import { useOciRegistriesContext } from '../../OciRegistriesContext';
import { getBuildNameValidations } from '../../../form/validations';

export const sourceImageStepId = 'source-image';

export const isSourceImageStepValid = (errors: FormikErrors<ImageBuildFormValues>) => {
  const { buildName, source } = errors;
  if (buildName) {
    return false;
  }
  if (!source) {
    return true;
  }
  return !source.repository && !source.imageName && !source.imageTag;
};

const SourceImageStep = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ImageBuildFormValues>();
  const { checkPermissions } = usePermissionsContext();
  const [canCreateRepo] = checkPermissions([{ kind: RESOURCE.REPOSITORY, verb: VERB.CREATE }]);
  const { ociRegistries, refetch } = useOciRegistriesContext();

  const imageReference = React.useMemo(() => {
    return getImageReference(ociRegistries, values.source);
  }, [ociRegistries, values.source]);

  return (
    <FlightCtlForm>
      <Grid lg={5} span={8}>
        <FormSection>
          <NameField
            name="buildName"
            aria-label={t('Build name')}
            isRequired
            resourceType="imagebuilds"
            validations={getBuildNameValidations(t)}
          />
          <RepositorySelect
            name="source.repository"
            label={t('Source repository')}
            repositories={ociRegistries}
            repoType={RepoSpecType.RepoSpecTypeOci}
            canCreateRepo={canCreateRepo}
            repoRefetch={refetch}
            isRequired
          />
          <FormGroup label={t('Image name')} fieldId="image-name" isRequired>
            <TextField
              name="source.imageName"
              aria-label={t('Image name')}
              helperText={t('The image name from the registry. For example: rhel9/rhel-bootc')}
            />
          </FormGroup>
          <FormGroup label={t('Image tag')} fieldId="image-tag" isRequired>
            <TextField
              name="source.imageTag"
              aria-label={t('Image tag')}
              helperText={t('Specify the version (e.g., latest or 9.6)')}
            />
          </FormGroup>
          <FormSection>
            <ImageUrlCard imageReference={imageReference} />
          </FormSection>
        </FormSection>
      </Grid>
    </FlightCtlForm>
  );
};

export default SourceImageStep;
