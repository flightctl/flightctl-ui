import * as React from 'react';
import { FieldArray, useField } from 'formik';
import { TFunction } from 'react-i18next';
import { Button, FormGroup, FormSection, Grid, Split, SplitItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { ImagePullPolicy } from '@flightctl/types';
import { ApplicationVolumeForm as VolumeFormType } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import ErrorHelperText from '../../../form/FieldHelperText';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';

import './ApplicationVolumeForm.css';

type ApplicationVolumeFormProps = {
  appFieldName: string;
  volumes: VolumeFormType[];
  isReadOnly?: boolean;
  isSingleContainerApp?: boolean;
};

const getPullPolicyOptions = (t: TFunction) => ({
  [ImagePullPolicy.PullIfNotPresent]: t('If not present'),
  [ImagePullPolicy.PullAlways]: t('Always'),
  [ImagePullPolicy.PullNever]: t('Never'),
});

const ApplicationVolumeForm = ({
  appFieldName,
  volumes,
  isReadOnly,
  isSingleContainerApp = false,
}: ApplicationVolumeFormProps) => {
  const { t } = useTranslation();
  const [, { error }] = useField<VolumeFormType[]>(`${appFieldName}.volumes`);

  const pullPolicyOptions = React.useMemo(() => getPullPolicyOptions(t), [t]);

  const volumesError = typeof error === 'string' ? error : undefined;
  return (
    <FormGroup label={t('Volumes')} className="fctl-application-volume-form">
      <FieldArray name={`${appFieldName}.volumes`}>
        {({ push, remove }) => (
          <>
            {volumes.map((volume, volumeIndex) => {
              const volumeFieldName = `${appFieldName}.volumes[${volumeIndex}]`;

              return (
                <FormSection key={volumeIndex}>
                  <Split hasGutter>
                    <SplitItem isFilled>
                      <ExpandableFormSection
                        title={volume.name || t('Volume {{ number }}', { number: volumeIndex + 1 })}
                        fieldName={volumeFieldName}
                      >
                        <Grid hasGutter>
                          <FormGroup label={t('Name')} isRequired>
                            <TextField
                              name={`${volumeFieldName}.name`}
                              aria-label={t('Volume name')}
                              isDisabled={isReadOnly}
                            />
                          </FormGroup>

                          {isSingleContainerApp && (
                            <FormGroup label={t('Mount path')} isRequired>
                              <TextField
                                name={`${volumeFieldName}.mountPath`}
                                aria-label={t('Mount path')}
                                isDisabled={isReadOnly}
                                helperText={t('Absolute path where the volume will be mounted on the container.')}
                              />
                            </FormGroup>
                          )}

                          <FormGroup label={t('Image reference')} isRequired={!isSingleContainerApp}>
                            <TextField
                              name={`${volumeFieldName}.imageRef`}
                              aria-label={t('Image reference')}
                              isDisabled={isReadOnly}
                              helperText={
                                isSingleContainerApp
                                  ? t('Optional: Provide a valid container image reference for the volume.')
                                  : t('Provide a valid container image reference for the volume.')
                              }
                            />
                          </FormGroup>

                          {volume.imageRef && (
                            <FormGroupWithHelperText label={t('Pull policy')} content={t('Pull policy for the image')}>
                              <FormSelect
                                name={`${volumeFieldName}.imagePullPolicy`}
                                items={pullPolicyOptions}
                                placeholderText={t('Select pull policy')}
                                isDisabled={isReadOnly}
                              />
                            </FormGroupWithHelperText>
                          )}
                        </Grid>
                      </ExpandableFormSection>
                    </SplitItem>
                    {!isReadOnly && (
                      <SplitItem>
                        <Button
                          aria-label={t('Delete volume')}
                          variant="link"
                          icon={<MinusCircleIcon />}
                          iconPosition="start"
                          onClick={() => remove(volumeIndex)}
                        />
                      </SplitItem>
                    )}
                  </Split>
                </FormSection>
              );
            })}
            <ErrorHelperText error={volumesError} />
            {!isReadOnly && (
              <FormGroup>
                <Button
                  variant="link"
                  icon={<PlusCircleIcon />}
                  iconPosition="start"
                  onClick={() => {
                    const emptyVolume: VolumeFormType = {
                      name: '',
                      imageRef: '',
                      imagePullPolicy: ImagePullPolicy.PullIfNotPresent,
                    };
                    if (isSingleContainerApp) {
                      emptyVolume.mountPath = '';
                    }
                    push(emptyVolume);
                  }}
                >
                  {t('Add volume')}
                </Button>
              </FormGroup>
            )}
          </>
        )}
      </FieldArray>
    </FormGroup>
  );
};

export default ApplicationVolumeForm;
