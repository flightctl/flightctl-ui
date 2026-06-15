import * as React from 'react';
import { FormGroup, FormSection } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { OciRepoSpec, RepoSpecType } from '@flightctl/types';
import { ImageBuildFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import FlightCtlForm from '../../../form/FlightCtlForm';
import NameField from '../../../form/NameField';
import TextField from '../../../form/TextField';
import RepositorySelect from '../../../form/RepositorySelect';
import { usePermissionsContext } from '../../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../../types/rbac';
import ImageUrlCard from '../../ImageUrlCard';
import { useOciRegistriesContext } from '../../OciRegistriesContext';
import { getBuildNameValidations } from '../../../form/validations';
import FormSelectTypeahead, { SelectItem } from '../../../form/FormSelectTypeahead';

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

  const ociRepoSpec = ociRegistries.find((reg) => reg.metadata.name === values.source.repository)?.spec as OciRepoSpec;

  const baseImages = ociRepoSpec?.baseImages || [];
  const imageTags = baseImages.find((i) => i.imageName === values.source.imageName)?.tags || [];
  return (
    <FlightCtlForm>
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
          helperText={t(
            'Only OCI-compliant registries are shown. Other repository types, such as Git or HTTP, are not supported for image builds.',
          )}
          canCreateRepo={canCreateRepo}
          repoRefetch={refetch}
          isRequired
          options={{
            enforcedRepoTypeMessage: t('Only OCI registries can be used for image builds.'),
          }}
        />
        <FormGroup label={t('Image name')} fieldId="image-name" isRequired>
          {baseImages.length ? (
            <FormSelectTypeahead
              name="source.imageName"
              items={baseImages.reduce(
                (acc, curr) => {
                  acc[curr.imageName] = {
                    label: curr.displayName || curr.imageName,
                    description: curr.displayName ? curr.imageName : undefined,
                  };
                  return acc;
                },
                {} as Record<string, SelectItem>,
              )}
              helperText={t('The image name from the registry. For example: rhel9/rhel-bootc')}
              isValidTypedItem={() => true}
            />
          ) : (
            <TextField
              name="source.imageName"
              aria-label={t('Image name')}
              helperText={t('The image name from the registry. For example: rhel9/rhel-bootc')}
            />
          )}
        </FormGroup>
        <FormGroup label={t('Image tag')} fieldId="image-tag" isRequired>
          {imageTags.length ? (
            <FormSelectTypeahead
              name="source.imageTag"
              items={imageTags.reduce((acc, curr) => {
                acc[curr] = curr;
                return acc;
              }, {})}
              isValidTypedItem={() => true}
              helperText={t('Specify the version (e.g., latest or 9.6)')}
            />
          ) : (
            <TextField
              name="source.imageTag"
              aria-label={t('Image tag')}
              helperText={t('Specify the version (e.g., latest or 9.6)')}
            />
          )}
        </FormGroup>
        <FormSection>
          <ImageUrlCard {...values.source} validateAccessibility />
        </FormSection>
      </FormSection>
    </FlightCtlForm>
  );
};

export default SourceImageStep;
