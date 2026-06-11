import * as React from 'react';
import { Alert, Content, FormGroup, FormSection, Gallery } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { RepoSpecType } from '@flightctl/types';
import { ExportFormatType } from '@flightctl/types/imagebuilder';
import { ImageBuildFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import FlightCtlForm from '../../../form/FlightCtlForm';
import TextField from '../../../form/TextField';
import RepositorySelect from '../../../form/RepositorySelect';
import { usePermissionsContext } from '../../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../../types/rbac';
import { SelectImageBuildExportCard } from '../../ImageExportCards';
import { getAllExportFormats } from '../../../../utils/imageBuilds';
import { useOciRegistriesContext } from '../../OciRegistriesContext';
import ImageUrlCard from '../../ImageUrlCard';

export const outputImageStepId = 'output-image';

export const isOutputImageStepValid = (errors: FormikErrors<ImageBuildFormValues>) => {
  const { destination } = errors;
  if (!destination) {
    return true;
  }
  return !destination.repository && !destination.imageName && !destination.imageTag;
};

const OutputImageStep = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<ImageBuildFormValues>();
  const { checkPermissions } = usePermissionsContext();
  const { ociRegistries, refetch } = useOciRegistriesContext();
  const [canCreateRepo] = checkPermissions([{ kind: RESOURCE.REPOSITORY, verb: VERB.CREATE }]);

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

  return (
    <FlightCtlForm>
      <FormSection>
        <Alert isInline variant="info" title={t('Management-ready by default')}>
          {t(
            'The agent is automatically included in this image. This ensures your devices are ready to be managed immediately after they are deployed.',
          )}
        </Alert>
        <RepositorySelect
          name="destination.repository"
          repositories={ociRegistries}
          repoType={RepoSpecType.RepoSpecTypeOci}
          canCreateRepo={canCreateRepo}
          repoRefetch={refetch}
          label={t('Target repository')}
          isRequired
          options={{
            writeAccessOnly: true,
          }}
          helperText={t(
            'Only OCI-compliant registries are shown. Other repository types, such as Git or HTTP, are not supported for image builds.',
          )}
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
            name="destination.imageTag"
            aria-label={t('Image tag')}
            helperText={t('Specify the version (e.g., latest or 9.6)')}
          />
        </FormGroup>
        <ImageUrlCard {...values.destination} />
        <FormGroup label={t('Export formats')} fieldId="export-formats">
          <Content component="p">
            {t(
              'Choose formats you need for this image. Each selection will generate a separate, ready-to-use image file.',
            )}
          </Content>
          <Gallery hasGutter minWidths={{ default: '320px' }}>
            {getAllExportFormats().map((format) => (
              <SelectImageBuildExportCard
                key={format}
                format={format}
                isChecked={values.exportFormats.includes(format)}
                onToggle={handleFormatToggle}
              />
            ))}
          </Gallery>
        </FormGroup>
        {values.exportFormats.length > 0 && (
          <Content>
            {t('{{count}} image export tasks will be created.', { count: values.exportFormats.length })}
          </Content>
        )}
      </FormSection>
    </FlightCtlForm>
  );
};

export default OutputImageStep;
