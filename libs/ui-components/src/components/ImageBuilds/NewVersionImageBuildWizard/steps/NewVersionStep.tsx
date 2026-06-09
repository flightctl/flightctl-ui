import * as React from 'react';
import { Content, FormGroup, Gallery } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';
import { OciRepoSpec } from '@flightctl/types';

import { ExportFormatType, ImageBuild } from '@flightctl/types/imagebuilder';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { getBuildNameValidations } from '../../../form/validations';
import NameField from '../../../form/NameField';
import ImageUrlCard from '../../ImageUrlCard';
import { NewVersionWizardFormValues } from '../types';
import { useOciRegistriesContext } from '../../OciRegistriesContext';
import FormSelectTypeaheadWrapper from '../../../form/FormSelectTypeahead';
import { SelectImageBuildExportCard } from '../../ImageExportCards';
import { getAllExportFormats } from '../../../../utils/imageBuilds';

export const newVersionStepId = 'new-version';

export const isNewVersionStepValid = (errors: FormikErrors<NewVersionWizardFormValues>) => {
  return !errors.buildName && !errors.sourceImageTag && !errors.destinationImageTag;
};

type NewVersionStepProps = {
  imageBuild: ImageBuild;
};

const NewVersionStep = ({ imageBuild }: NewVersionStepProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<NewVersionWizardFormValues>();
  const { ociRegistries } = useOciRegistriesContext();

  const ociRegistrySpec = ociRegistries.find((registry) => registry.metadata.name === imageBuild.spec.source.repository)
    ?.spec as OciRepoSpec | undefined;

  const baseImage = ociRegistrySpec?.baseImages?.find(
    (baseImage) => baseImage.imageName === imageBuild.spec.source.imageName,
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

  return (
    <FlightCtlForm>
      <NameField
        name="buildName"
        aria-label={t('Build name')}
        isRequired
        validations={getBuildNameValidations(t)}
        resourceType="imagebuilds"
      />
      <FormGroup label={t('Base image tag')}>
        {baseImage?.tags?.length ? (
          <FormSelectTypeaheadWrapper
            name="sourceImageTag"
            items={baseImage.tags.reduce((acc, curr) => {
              acc[curr] = curr;
              return acc;
            }, {})}
            isValidTypedItem={() => true}
            helperText={t('Specify the version (e.g., latest or 9.6)')}
          />
        ) : (
          <TextField name="sourceImageTag" aria-label={t('Base image tag')} />
        )}
      </FormGroup>
      <ImageUrlCard
        {...imageBuild.spec.source}
        imageTag={values.sourceImageTag || imageBuild.spec.source.imageTag}
        validateAccessibility
      />
      <FormGroup label={t('Output image tag')}>
        <TextField
          name="destinationImageTag"
          aria-label={t('Output image tag')}
          helperText={t('Tag for the built image. Defaults to the parent tag incremented by one.')}
        />
      </FormGroup>
      <ImageUrlCard
        {...imageBuild.spec.destination}
        imageTag={values.destinationImageTag || imageBuild.spec.destination.imageTag}
      />
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
        <Content>{t('{{count}} image export tasks will be created.', { count: values.exportFormats.length })}</Content>
      )}
    </FlightCtlForm>
  );
};

export default NewVersionStep;
