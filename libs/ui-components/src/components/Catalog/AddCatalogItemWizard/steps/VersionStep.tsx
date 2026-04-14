import * as React from 'react';
import { Button, FormGroup, FormSection, Grid, GridItem, Split, SplitItem, Title } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { FieldArray, FormikErrors, useField, useFormikContext } from 'formik';

import { CatalogItemArtifactType } from '@flightctl/types/alpha';

import { useTranslation } from '../../../../hooks/useTranslation';
import { AddCatalogItemFormValues, VersionFormValues, configurableAppTypes } from '../types';
import { getEmptyVersion } from '../utils';
import { appTypeIds } from '../../useCatalogs';
import TextField from '../../../form/TextField';
import TextAreaField from '../../../form/TextAreaField';
import CheckboxField from '../../../form/CheckboxField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import ChannelsSelect from '../ChannelsSelect';
import UploadField from '../../../form/UploadField';
import ErrorHelperText from '../../../form/FieldHelperText';
import { getArtifactLabel } from '../../utils';

export const versionStepId = 'version';

export const isVersionStepValid = (errors: FormikErrors<AddCatalogItemFormValues>) => {
  return !errors.versions;
};

const VersionEntry = ({
  index,
  availableChannels,
  isReadOnly,
  isEdit,
}: {
  index: number;
  availableChannels: string[];
  isReadOnly?: boolean;
  isEdit: boolean;
}) => {
  const { values } = useFormikContext<AddCatalogItemFormValues>();
  const showConfig = !!values.type && configurableAppTypes.includes(values.type);
  const { t } = useTranslation();
  const prefix = `versions.${index}`;

  return (
    <Grid hasGutter>
      <FormGroup label={t('Version')} isRequired>
        <TextField
          name={`${prefix}.version`}
          aria-label={t('Version')}
          isRequired
          isDisabled={isReadOnly}
          helperText={t('Must be valid semver version (such as 1.0.0)')}
        />
      </FormGroup>
      <FormGroup label={t('Channels')} isRequired>
        <ChannelsSelect name={`${prefix}.channels`} availableChannels={availableChannels} isDisabled={isReadOnly} />
      </FormGroup>
      <ReferencesField index={index} isReadOnly={isReadOnly} />
      <FormSection title={t('Updates')}>
        <FormGroup label={t('Replaces')}>
          <TextField
            name={`${prefix}.replaces`}
            aria-label={t('Replaces')}
            placeholder="1.0.0"
            isDisabled={isReadOnly}
            helperText={t('Single version this one replaces, defining the primary upgrade edge')}
          />
        </FormGroup>
        <FormGroup label={t('Skips')}>
          <TextField
            name={`${prefix}.skips`}
            aria-label={t('Skips')}
            placeholder="1.0.1, 1.0.2"
            isDisabled={isReadOnly}
            helperText={t('Comma-separated versions that can upgrade directly to this one')}
          />
        </FormGroup>
        <FormGroup label={t('Skip range')}>
          <TextField
            name={`${prefix}.skipRange`}
            aria-label={t('Skip range')}
            placeholder=">=1.0.0 <1.5.0"
            isDisabled={isReadOnly}
            helperText={t('Semver range of versions that can upgrade directly to this one')}
          />
        </FormGroup>
      </FormSection>
      <FormGroup label={t('Readme')}>
        <TextAreaField
          name={`${prefix}.readme`}
          aria-label={t('Readme')}
          isDisabled={isReadOnly}
          helperText={t('Markdown documentation for this version')}
        />
      </FormGroup>
      {showConfig && (
        <FormSection title={t('Application configuration')}>
          <UploadField name={`${prefix}.config`} ariaLabel={t('Configuration')} isDisabled={isReadOnly} />
          <FormGroup
            label={t('JSON schema')}
            labelHelp={t('JSON Schema for this version (JSON or YAML format). Overrides the default config schema.')}
          >
            <UploadField name={`${prefix}.configSchema`} ariaLabel={t('Config schema')} isDisabled={isReadOnly} />
          </FormGroup>
        </FormSection>
      )}
      {isEdit && (
        <CheckboxField name={`${prefix}.deprecated`} label={t('Deprecated')} isDisabled={isReadOnly}>
          <FormGroup label={t('Deprecation message')} isRequired>
            <TextAreaField
              name={`${prefix}.deprecationMessage`}
              aria-label={t('Deprecation message')}
              isRequired
              isDisabled={isReadOnly}
            />
          </FormGroup>
        </CheckboxField>
      )}
    </Grid>
  );
};

const ReferencesField = ({ index, isReadOnly }: { index: number; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<AddCatalogItemFormValues>();
  const prefix = `versions.${index}`;
  const isApp = !!values.type && appTypeIds.includes(values.type);
  const [, refsMeta] = useField(`${prefix}.references`);
  const refsError = refsMeta.touched && typeof refsMeta.error === 'string' ? refsMeta.error : undefined;

  if (isApp) {
    return (
      <FormGroup label={t('Container reference')} isRequired>
        <TextField
          name={`${prefix}.references.${CatalogItemArtifactType.CatalogItemArtifactTypeContainer}`}
          aria-label={t('Container reference')}
          isDisabled={isReadOnly}
          helperText={t('Tag, digest, or complete image reference')}
        />
        <ErrorHelperText error={refsError} />
      </FormGroup>
    );
  }

  const artifactsWithType = values.artifacts.filter((a) => a.type);

  if (artifactsWithType.length === 0) {
    return null;
  }

  return (
    <FormSection title={t('References')}>
      {artifactsWithType.map((artifact) => {
        return (
          <FormGroup
            key={artifact.type}
            label={getArtifactLabel(t, artifact.type as CatalogItemArtifactType, artifact.name)}
          >
            <TextField
              name={`${prefix}.references.${artifact.type}`}
              aria-label={t('{{type}} reference', { type: artifact.type })}
              isDisabled={isReadOnly}
              helperText={t('Tag, digest, or complete image reference')}
            />
          </FormGroup>
        );
      })}
      <ErrorHelperText error={refsError} />
    </FormSection>
  );
};

const VersionStep = ({ isReadOnly, isEdit }: { isReadOnly?: boolean; isEdit: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<AddCatalogItemFormValues>();

  const availableChannels = React.useMemo(() => {
    const channelSet = new Set<string>();
    values.versions.forEach((v) => v.channels.forEach((c) => channelSet.add(c)));
    return Array.from(channelSet);
  }, [values.versions]);

  return (
    <Grid hasGutter>
      <GridItem>
        <Title headingLevel="h2" size="lg">
          {t('Versions')}
        </Title>
      </GridItem>
      <GridItem>
        <FlightCtlForm>
          <FieldArray name="versions">
            {(arrayHelpers) => (
              <>
                {values.versions.map((v: VersionFormValues, index: number) => (
                  <Split hasGutter key={index}>
                    <SplitItem isFilled>
                      <ExpandableFormSection
                        title={t('Version {{ num }}', { num: v.version || index + 1 })}
                        fieldName={`versions.${index}`}
                        defaultExpanded={!isEdit}
                      >
                        <VersionEntry
                          index={index}
                          availableChannels={availableChannels}
                          isReadOnly={isReadOnly}
                          isEdit={isEdit}
                        />
                      </ExpandableFormSection>
                    </SplitItem>
                    {!isReadOnly && (
                      <SplitItem>
                        <Button
                          aria-label={t('Remove version')}
                          variant="link"
                          icon={<MinusCircleIcon />}
                          iconPosition="start"
                          onClick={() => arrayHelpers.remove(index)}
                          isDisabled={values.versions.length === 1}
                        />
                      </SplitItem>
                    )}
                  </Split>
                ))}
                {!isReadOnly && (
                  <FormSection>
                    <FormGroup>
                      <Button
                        variant="link"
                        icon={<PlusCircleIcon />}
                        iconPosition="start"
                        onClick={() => arrayHelpers.push(getEmptyVersion())}
                      >
                        {t('Add version')}
                      </Button>
                    </FormGroup>
                  </FormSection>
                )}
              </>
            )}
          </FieldArray>
        </FlightCtlForm>
      </GridItem>
    </Grid>
  );
};

export default VersionStep;
