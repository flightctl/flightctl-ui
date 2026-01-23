import * as React from 'react';
import { Alert, Content, FormGroup, FormSection, Gallery, Grid } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { OciRepoSpec, RepoSpecType, Repository } from '@flightctl/types';
import { ExportFormatType } from '@flightctl/types/imagebuilder';
import { ImageBuildFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import FlightCtlForm from '../../../form/FlightCtlForm';
import TextField from '../../../form/TextField';
import RepositorySelect from '../../../form/RepositorySelect';
import { usePermissionsContext } from '../../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../../types/rbac';
import { SelectImageBuildExportCard } from '../../ImageExportCards';
import { getExpectedOutputImageReference } from '../../../../utils/imageBuilds';
import { isOciRepoSpec } from '../../../Repository/CreateRepository/utils';
import ImageUrlCard from '../../ImageUrlCard';
import { useOciRegistriesContext } from '../../OciRegistriesContext';

export const outputImageStepId = 'output-image';

export const isOutputImageStepValid = (errors: FormikErrors<ImageBuildFormValues>) => {
  const { destination } = errors;
  if (!destination) {
    return true;
  }
  return !destination.repository && !destination.imageName && !destination.tag;
};

const OutputImageStep = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<ImageBuildFormValues>();
  const { checkPermissions } = usePermissionsContext();
  const { ociRegistries, refetch } = useOciRegistriesContext();
  const [canCreateRepo] = checkPermissions([{ kind: RESOURCE.REPOSITORY, verb: VERB.CREATE }]);

  const writableRepoValidation = React.useCallback(
    (repo: Repository) => {
      if (isOciRepoSpec(repo.spec) && repo.spec.accessMode === OciRepoSpec.accessMode.READ) {
        return t('Repository is read-only and cannot be used as the target repository.');
      }
      return undefined;
    },
    [t],
  );

  const handleFormatToggle = (format: ExportFormatType, isChecked: boolean) => {
    const currentFormats = values.exportFormats;
    if (isChecked) {
      setFieldValue('exportFormats', [...currentFormats, format]);
    } else {
      setFieldValue(
        'exportFormats',
        currentFormats.filter((f) => f !== format),
      );
    }
  };

  const imageReference = React.useMemo(() => {
    return getExpectedOutputImageReference(values.destination, ociRegistries);
  }, [ociRegistries, values.destination]);

  return (
    <FlightCtlForm>
      <Grid lg={6} span={8}>
        <FormSection>
          <Alert isInline variant="info" title={t('Management-ready by default')}>
            {t(
              'The agent is automatically included in this image. This ensures your devices are ready to be managed immediately after they are deployed.',
            )}
          </Alert>
          <RepositorySelect
            name="destination.repository"
            repositories={ociRegistries}
            repoType={RepoSpecType.OCI}
            canCreateRepo={canCreateRepo}
            repoRefetch={refetch}
            label={t('Target repository')}
            isRequired
            validateRepoSelection={writableRepoValidation}
            helperText={t('Storage repository for your completed image.')}
          />
          <FormGroup label={t('Image name')} fieldId="image-name" isRequired>
            <TextField
              name="destination.imageName"
              aria-label={t('Image name')}
              helperText={t('The image name that will be pushed to the repository. For example: flightctl/rhel-bootc')}
            />
          </FormGroup>
          <FormGroup label={t('Image tag')} fieldId="image-tag" isRequired>
            <TextField
              name="destination.tag"
              aria-label={t('Image tag')}
              helperText={t('Specify the version (e.g., latest or 9.6)')}
            />
          </FormGroup>
          <ImageUrlCard imageReference={imageReference} />
          <FormGroup label={t('Export formats')} fieldId="export-formats">
            <Content component="p">
              {t(
                'Choose formats you need for this image. Each selection will generate a separate, ready-to-use image file.',
              )}
            </Content>
            <Gallery hasGutter minWidths={{ default: '320px' }}>
              <SelectImageBuildExportCard
                format={ExportFormatType.ExportFormatTypeVMDK}
                isChecked={values.exportFormats.includes(ExportFormatType.ExportFormatTypeVMDK)}
                onToggle={handleFormatToggle}
              />
              <SelectImageBuildExportCard
                format={ExportFormatType.ExportFormatTypeQCOW2}
                isChecked={values.exportFormats.includes(ExportFormatType.ExportFormatTypeQCOW2)}
                onToggle={handleFormatToggle}
              />
              <SelectImageBuildExportCard
                format={ExportFormatType.ExportFormatTypeISO}
                isChecked={values.exportFormats.includes(ExportFormatType.ExportFormatTypeISO)}
                onToggle={handleFormatToggle}
              />
            </Gallery>
          </FormGroup>
          {values.exportFormats.length > 0 && (
            <Content>
              {t('{{count}} image export tasks will be created.', { count: values.exportFormats.length })}
            </Content>
          )}
        </FormSection>
      </Grid>
    </FlightCtlForm>
  );
};

export default OutputImageStep;
