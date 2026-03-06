import * as React from 'react';
import { Button, FormGroup, FormSection, Grid, GridItem, Split, SplitItem, Title } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { FieldArray, FormikErrors, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import { AddCatalogItemFormValues, VersionFormValues, configurableAppTypes } from '../types';
import { getEmptyVersion } from '../utils';
import TextField from '../../../form/TextField';
import TextAreaField from '../../../form/TextAreaField';
import RadioField from '../../../form/RadioField';
import CheckboxField from '../../../form/CheckboxField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import ChannelsSelect from '../ChannelsSelect';
import UploadField from '../../../form/UploadField';

export const versionStepId = 'version';

export const isVersionStepValid = (errors: FormikErrors<AddCatalogItemFormValues>) => {
  return !errors.versions;
};

const VersionEntry = ({ index, availableChannels }: { index: number; availableChannels: string[] }) => {
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
          helperText={t('Must be valid semver version (such as 1.0.0)')}
        />
      </FormGroup>
      <FormGroup label={t('Image reference')}>
        <Split hasGutter>
          <SplitItem>
            <RadioField id={`${prefix}-ref-tag`} name={`${prefix}.refType`} label={t('Tag')} checkedValue="tag" />
          </SplitItem>
          <SplitItem>
            <RadioField
              id={`${prefix}-ref-digest`}
              name={`${prefix}.refType`}
              label={t('Digest')}
              checkedValue="digest"
            />
          </SplitItem>
        </Split>
      </FormGroup>
      <TagOrDigestField index={index} />
      <FormGroup label={t('Channels')} isRequired>
        <ChannelsSelect name={`${prefix}.channels`} availableChannels={availableChannels} />
      </FormGroup>
      <FormSection title={t('Updates')}>
        <FormGroup label={t('Replaces')}>
          <TextField
            name={`${prefix}.replaces`}
            aria-label={t('Replaces')}
            placeholder="1.0.0"
            helperText={t('Single version this one replaces, defining the primary upgrade edge')}
          />
        </FormGroup>
        <FormGroup label={t('Skips')}>
          <TextField
            name={`${prefix}.skips`}
            aria-label={t('Skips')}
            placeholder="1.0.1, 1.0.2"
            helperText={t('Comma-separated versions that can upgrade directly to this one')}
          />
        </FormGroup>
        <FormGroup label={t('Skip range')}>
          <TextField
            name={`${prefix}.skipRange`}
            aria-label={t('Skip range')}
            placeholder=">=1.0.0 <1.5.0"
            helperText={t('Semver range of versions that can upgrade directly to this one')}
          />
        </FormGroup>
      </FormSection>
      <FormGroup label={t('Readme')}>
        <TextAreaField
          name={`${prefix}.readme`}
          aria-label={t('Readme')}
          helperText={t('Markdown documentation for this version')}
        />
      </FormGroup>
      {showConfig && (
        <FormSection title={t('Application configuration')}>
          <UploadField name={`${prefix}.config`} ariaLabel={t('Configuration')} />
          <FormGroup
            label={t('JSON schema')}
            labelHelp={t('JSON Schema for this version (JSON or YAML format). Overrides the default config schema.')}
          >
            <UploadField name={`${prefix}.configSchema`} ariaLabel={t('Config schema')} />
          </FormGroup>
        </FormSection>
      )}
      <CheckboxField name={`${prefix}.deprecated`} label={t('Deprecated')}>
        <FormGroup label={t('Deprecation message')} isRequired>
          <TextAreaField name={`${prefix}.deprecationMessage`} aria-label={t('Deprecation message')} isRequired />
        </FormGroup>
      </CheckboxField>
    </Grid>
  );
};

const TagOrDigestField = ({ index }: { index: number }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<AddCatalogItemFormValues>();
  const version = values.versions[index];
  const prefix = `versions.${index}`;

  return version.refType === 'digest' ? (
    <FormGroup label={t('Digest')} isRequired>
      <TextField
        name={`${prefix}.digest`}
        aria-label={t('Digest')}
        isRequired
        placeholder="sha256:abc123..."
        helperText={
          version.digest
            ? t('Full image reference: {{ref}}', { ref: `${values.referenceUri}@${version.digest}` })
            : undefined
        }
      />
    </FormGroup>
  ) : (
    <FormGroup label={t('Tag')} isRequired>
      <TextField
        name={`${prefix}.tag`}
        aria-label={t('Tag')}
        isRequired
        placeholder="1.0.0"
        helperText={
          version.tag ? t('Full image reference: {{ref}}', { ref: `${values.referenceUri}:${version.tag}` }) : undefined
        }
      />
    </FormGroup>
  );
};

const VersionStep = () => {
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
      <GridItem lg={6} md={8}>
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
                        defaultExpanded={false}
                      >
                        <VersionEntry index={index} availableChannels={availableChannels} />
                      </ExpandableFormSection>
                    </SplitItem>
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
                  </Split>
                ))}
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
              </>
            )}
          </FieldArray>
        </FlightCtlForm>
      </GridItem>
    </Grid>
  );
};

export default VersionStep;
