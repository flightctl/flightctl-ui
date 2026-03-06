import * as React from 'react';
import { Button, FormGroup, FormSection, Grid, GridItem, Split, SplitItem, Title } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { FieldArray, FormikErrors, useFormikContext } from 'formik';

import { CatalogItemArtifactType, CatalogItemType } from '@flightctl/types/alpha';

import { useTranslation } from '../../../../hooks/useTranslation';
import { AddCatalogItemFormValues, ArtifactFormValue, configurableAppTypes } from '../types';
import { getEmptyArtifact } from '../utils';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import FlightCtlForm from '../../../form/FlightCtlForm';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import UploadField from '../../../form/UploadField';
import { TFunction } from 'i18next';

export const typeConfigStepId = 'type-config';

export const isTypeConfigStepValid = (errors: FormikErrors<AddCatalogItemFormValues>) => {
  return (
    !errors.type && !errors.referenceUri && !errors.artifacts && !errors.defaultConfig && !errors.defaultConfigSchema
  );
};

const catalogItemTypeLabels = (
  t: TFunction,
): Record<
  Exclude<CatalogItemType, CatalogItemType.CatalogItemTypeDriver | CatalogItemType.CatalogItemTypeFirmware>,
  string
> => ({
  [CatalogItemType.CatalogItemTypeOS]: t('Operating system'),
  [CatalogItemType.CatalogItemTypeContainer]: t('Single Container application'),
  [CatalogItemType.CatalogItemTypeHelm]: t('Helm application'),
  [CatalogItemType.CatalogItemTypeQuadlet]: t('Quadlet application'),
  [CatalogItemType.CatalogItemTypeCompose]: t('Compose application'),
  [CatalogItemType.CatalogItemTypeData]: t('Data'),
});

const artifactTypeLabels: Record<CatalogItemArtifactType, string> = {
  [CatalogItemArtifactType.CatalogItemArtifactTypeContainer]: 'Container',
  [CatalogItemArtifactType.CatalogItemArtifactTypeQcow2]: 'QCOW2',
  [CatalogItemArtifactType.CatalogItemArtifactTypeAmi]: 'AMI',
  [CatalogItemArtifactType.CatalogItemArtifactTypeIso]: 'ISO',
  [CatalogItemArtifactType.CatalogItemArtifactTypeAnacondaIso]: 'Anaconda ISO',
  [CatalogItemArtifactType.CatalogItemArtifactTypeVmdk]: 'VMDK',
  [CatalogItemArtifactType.CatalogItemArtifactTypeVhd]: 'VHD',
  [CatalogItemArtifactType.CatalogItemArtifactTypeRaw]: 'Raw',
  [CatalogItemArtifactType.CatalogItemArtifactTypeGce]: 'GCE',
};

const getArtifactTitle = (artifact: ArtifactFormValue, index: number, t: ReturnType<typeof useTranslation>['t']) => {
  const typeLabel = artifact.type ? artifactTypeLabels[artifact.type] : '';
  if (typeLabel && artifact.name) {
    return `${typeLabel} (${artifact.name})`;
  }
  if (typeLabel) {
    return typeLabel;
  }
  if (artifact.name) {
    return artifact.name;
  }
  return t('Artifact {{ num }}', { num: index + 1 });
};

const TypeConfigStep = ({ isEdit }: { isEdit?: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<AddCatalogItemFormValues>();

  let referenceURIField: React.ReactNode = undefined;

  if (values.type) {
    switch (values.type) {
      case CatalogItemType.CatalogItemTypeOS: {
        referenceURIField = (
          <FormGroup label={t('System image')} isRequired>
            <TextField
              name="referenceUri"
              aria-label={t('System image')}
              isRequired
              helperText={t(
                'Must be a reference to a bootable container image (such as "quay.io/<my-org>/my-rhel-with-fc-agent")',
              )}
            />
          </FormGroup>
        );
        break;
      }
      case CatalogItemType.CatalogItemTypeData: {
        referenceURIField = (
          <FormGroup label={t('Image reference')} isRequired>
            <TextField
              name="referenceUri"
              aria-label={t('Image reference')}
              isRequired
              helperText={t('Provide a valid container image reference')}
            />
          </FormGroup>
        );
        break;
      }
      default: {
        referenceURIField = (
          <FormGroup label={t('Application image')} isRequired>
            <TextField
              name="referenceUri"
              aria-label={t('Application image')}
              isRequired
              helperText={t('Provide a valid container image reference')}
            />
          </FormGroup>
        );
        break;
      }
    }
  }

  return (
    <Grid hasGutter>
      <GridItem>
        <Title headingLevel="h2" size="lg">
          {t('Type and configuration')}
        </Title>
      </GridItem>
      <GridItem lg={6} md={8}>
        <FlightCtlForm>
          <FormGroup label={t('Type')} isRequired>
            <FormSelect
              name="type"
              items={catalogItemTypeLabels(t)}
              placeholderText={t('Select a type')}
              isDisabled={isEdit}
            />
          </FormGroup>
          {referenceURIField}
          {values.type === CatalogItemType.CatalogItemTypeOS && (
            <FieldArray name="artifacts">
              {(arrayHelpers) => (
                <>
                  {values.artifacts.map((artifact, index) => (
                    <FormSection key={index}>
                      <Split hasGutter>
                        <SplitItem isFilled>
                          <ExpandableFormSection
                            title={getArtifactTitle(artifact, index, t)}
                            fieldName={`artifacts.${index}`}
                          >
                            <Grid hasGutter>
                              <FormGroup label={t('Type')}>
                                <FormSelect
                                  name={`artifacts.${index}.type`}
                                  items={artifactTypeLabels}
                                  placeholderText={t('Select a type')}
                                />
                              </FormGroup>
                              <FormGroup label={t('URI')} isRequired>
                                <TextField
                                  name={`artifacts.${index}.uri`}
                                  aria-label={t('Artifact URI')}
                                  isRequired
                                  placeholder="https://example.com/image.qcow2"
                                />
                              </FormGroup>
                              <FormGroup label={t('Name')}>
                                <TextField
                                  name={`artifacts.${index}.name`}
                                  aria-label={t('Artifact name')}
                                  placeholder={t('Optional display name')}
                                />
                              </FormGroup>
                            </Grid>
                          </ExpandableFormSection>
                        </SplitItem>
                        <SplitItem>
                          <Button
                            aria-label={t('Remove artifact')}
                            variant="link"
                            icon={<MinusCircleIcon />}
                            iconPosition="start"
                            onClick={() => arrayHelpers.remove(index)}
                          />
                        </SplitItem>
                      </Split>
                    </FormSection>
                  ))}
                  <FormGroup>
                    <Button
                      variant="link"
                      icon={<PlusCircleIcon />}
                      iconPosition="start"
                      onClick={() => arrayHelpers.push(getEmptyArtifact())}
                    >
                      {t('Add artifact')}
                    </Button>
                  </FormGroup>
                </>
              )}
            </FieldArray>
          )}

          {values.type && configurableAppTypes.includes(values.type) && (
            <FormSection title={t('Default configuration')}>
              <UploadField name="defaultConfig" ariaLabel={t('Configuration')} />
              <FormGroup
                label={t('JSON schema')}
                labelHelp={t(
                  'JSON Schema defining configurable parameters (JSON or YAML format). Can be overridden per version.',
                )}
              >
                <UploadField name="defaultConfigSchema" ariaLabel={t('Default config schema')} />
              </FormGroup>
            </FormSection>
          )}
        </FlightCtlForm>
      </GridItem>
    </Grid>
  );
};

export default TypeConfigStep;
