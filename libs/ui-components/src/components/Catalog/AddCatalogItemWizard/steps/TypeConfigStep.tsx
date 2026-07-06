import * as React from 'react';
import { Button, FormGroup, FormSection, Grid, GridItem, Split, SplitItem, Title } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { FieldArray, FormikErrors, useFormikContext } from 'formik';
import { TFunction } from 'i18next';
import { CatalogItemArtifactType, CatalogItemType } from '@flightctl/types/alpha';

import { useTranslation } from '../../../../hooks/useTranslation';
import { AddCatalogItemFormValues, ArtifactFormValue, configurableAppTypes } from '../types';
import { getEmptyArtifact } from '../utils';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import FlightCtlForm from '../../../form/FlightCtlForm';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import UploadField from '../../../form/UploadField';
import { getArtifactLabel, getCatalogItemBadge } from '../../utils';

export const typeConfigStepId = 'type-config';

export const isTypeConfigStepValid = (errors: FormikErrors<AddCatalogItemFormValues>) => {
  return (
    !errors.type && !errors.artifacts && !errors.containerUri && !errors.defaultConfig && !errors.defaultConfigSchema
  );
};

const catalogItemTypeLabels = (
  t: TFunction,
): Record<
  Exclude<CatalogItemType, CatalogItemType.CatalogItemTypeDriver | CatalogItemType.CatalogItemTypeFirmware>,
  string
> => ({
  [CatalogItemType.CatalogItemTypeOS]: getCatalogItemBadge(CatalogItemType.CatalogItemTypeOS, t),
  [CatalogItemType.CatalogItemTypeContainer]: getCatalogItemBadge(CatalogItemType.CatalogItemTypeContainer, t),
  [CatalogItemType.CatalogItemTypeHelm]: getCatalogItemBadge(CatalogItemType.CatalogItemTypeHelm, t),
  [CatalogItemType.CatalogItemTypeQuadlet]: getCatalogItemBadge(CatalogItemType.CatalogItemTypeQuadlet, t),
  [CatalogItemType.CatalogItemTypeCompose]: getCatalogItemBadge(CatalogItemType.CatalogItemTypeCompose, t),
  [CatalogItemType.CatalogItemTypeData]: getCatalogItemBadge(CatalogItemType.CatalogItemTypeData, t),
});

const getArtifactTitle = (artifact: ArtifactFormValue, index: number, t: ReturnType<typeof useTranslation>['t']) => {
  const typeLabel = artifact.type ? getArtifactLabel(t, artifact.type, artifact.name) : artifact.name;
  return typeLabel || t('Artifact {{ num }}', { num: index + 1 });
};

const TypeConfigStep = ({ isEdit, isReadOnly }: { isEdit?: boolean; isReadOnly?: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<AddCatalogItemFormValues>();

  let referenceURIField: React.ReactNode = undefined;

  if (values.type) {
    switch (values.type) {
      case CatalogItemType.CatalogItemTypeOS: {
        break;
      }
      case CatalogItemType.CatalogItemTypeData: {
        referenceURIField = (
          <FormGroup label={t('Image reference')} isRequired>
            <TextField
              name="containerUri"
              aria-label={t('Image reference')}
              isRequired
              isDisabled={isReadOnly}
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
              name="containerUri"
              aria-label={t('Application image')}
              isRequired
              isDisabled={isReadOnly}
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
      <GridItem>
        <FlightCtlForm>
          <FormGroup label={t('Type')} isRequired>
            <FormSelect
              name="type"
              items={catalogItemTypeLabels(t)}
              placeholderText={t('Select a type')}
              isDisabled={isEdit || isReadOnly}
            />
          </FormGroup>
          {referenceURIField}
          {values.type === CatalogItemType.CatalogItemTypeOS && (
            <FieldArray name="artifacts">
              {(arrayHelpers) => (
                <>
                  {values.artifacts.map((artifact, index) => (
                    <Split hasGutter key={artifact.type}>
                      <SplitItem isFilled>
                        <ExpandableFormSection
                          title={getArtifactTitle(artifact, index, t)}
                          fieldName={`artifacts.${index}`}
                        >
                          <Grid hasGutter>
                            <FormGroup label={t('Type')} isRequired>
                              <FormSelect
                                name={`artifacts.${index}.type`}
                                items={Object.values(CatalogItemArtifactType).reduce((acc, curr) => {
                                  acc[curr] = getArtifactLabel(t, curr);
                                  return acc;
                                }, {})}
                                placeholderText={t('Select a type')}
                                isDisabled={isReadOnly}
                              />
                            </FormGroup>
                            <FormGroup label={t('URI')} isRequired>
                              <TextField
                                name={`artifacts.${index}.uri`}
                                aria-label={t('Artifact URI')}
                                isRequired
                                isDisabled={isReadOnly}
                                placeholder="https://example.com/image.qcow2"
                              />
                            </FormGroup>
                            <FormGroup label={t('Name')}>
                              <TextField
                                name={`artifacts.${index}.name`}
                                aria-label={t('Artifact name')}
                                helperText={t('Optional display name')}
                                isDisabled={isReadOnly}
                              />
                            </FormGroup>
                          </Grid>
                        </ExpandableFormSection>
                      </SplitItem>
                      {!isReadOnly && (
                        <SplitItem>
                          <Button
                            aria-label={t('Remove artifact')}
                            variant="link"
                            icon={<MinusCircleIcon />}
                            iconPosition="start"
                            onClick={() => arrayHelpers.remove(index)}
                            isDisabled={values.artifacts.length === 1}
                          />
                        </SplitItem>
                      )}
                    </Split>
                  ))}
                  {!isReadOnly && (
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
                  )}
                </>
              )}
            </FieldArray>
          )}

          {values.type && configurableAppTypes.includes(values.type) && (
            <FormSection title={t('Default configuration')}>
              <UploadField name="defaultConfig" ariaLabel={t('Configuration')} isDisabled={isReadOnly} />
              <FormGroup
                label={t('JSON schema')}
                labelHelp={t(
                  'JSON Schema defining configurable parameters (JSON or YAML format). Can be overridden per version.',
                )}
              >
                <UploadField
                  name="defaultConfigSchema"
                  ariaLabel={t('Default config schema')}
                  isDisabled={isReadOnly}
                />
              </FormGroup>
            </FormSection>
          )}
        </FlightCtlForm>
      </GridItem>
    </Grid>
  );
};

export default TypeConfigStep;
