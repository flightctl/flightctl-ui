import * as React from 'react';
import { FieldArray, useField } from 'formik';
import { TFunction } from 'react-i18next';
import { Button, FormGroup, FormSection, Grid, Split, SplitItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { ImagePullPolicy } from '@flightctl/types';
import { ApplicationVolumeForm as VolumeFormType, VolumeType } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import ErrorHelperText from '../../../form/FieldHelperText';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';

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

const getVolumeTypeOptions = (t: TFunction, isSingleContainerApp: boolean): Record<string, string> => {
  if (isSingleContainerApp) {
    return {
      [VolumeType.MOUNT_ONLY]: t('Mount volume'),
      [VolumeType.IMAGE_MOUNT]: t('Image mount volume'),
    };
  }
  return {
    [VolumeType.IMAGE_ONLY]: t('Image volume'),
  };
};

const ApplicationVolumeForm = ({
  appFieldName,
  volumes,
  isReadOnly,
  isSingleContainerApp = false,
}: ApplicationVolumeFormProps) => {
  const { t } = useTranslation();
  const [, { error }] = useField<VolumeFormType[]>(`${appFieldName}.volumes`);

  const { volumeTypeOptions, pullPolicyOptions } = React.useMemo(
    () => ({
      volumeTypeOptions: getVolumeTypeOptions(t, isSingleContainerApp),
      pullPolicyOptions: getPullPolicyOptions(t),
    }),
    [t, isSingleContainerApp],
  );

  const volumesError = typeof error === 'string' ? error : undefined;
  return (
    <FormGroup label={t('Volumes')}>
      <FieldArray name={`${appFieldName}.volumes`}>
        {({ push, remove }) => (
          <>
            {volumes.map((volume, volumeIndex) => {
              const volumeFieldName = `${appFieldName}.volumes[${volumeIndex}]`;
              const hasImage =
                volume.volumeType === VolumeType.IMAGE_ONLY || volume.volumeType === VolumeType.IMAGE_MOUNT;
              const hasMount =
                volume.volumeType === VolumeType.MOUNT_ONLY || volume.volumeType === VolumeType.IMAGE_MOUNT;

              return (
                <FormSection key={volumeIndex} className="pf-v5-u-mt-md">
                  <Split hasGutter>
                    <SplitItem isFilled>
                      <ExpandableFormSection
                        title={volume.name || t('Volume {{ number }}', { number: volumeIndex + 1 })}
                        fieldName={volumeFieldName}
                      >
                        <Grid hasGutter>
                          <FormGroup label={t('Volume type')} isRequired>
                            <FormSelect
                              name={`${volumeFieldName}.volumeType`}
                              items={volumeTypeOptions}
                              placeholderText={t('Select volume type')}
                              isDisabled={isReadOnly}
                            />
                          </FormGroup>

                          <FormGroup label={t('Name')} isRequired>
                            <TextField
                              aria-label={t('Volume name')}
                              name={`${volumeFieldName}.name`}
                              value={volume.name || ''}
                              isDisabled={isReadOnly}
                            />
                          </FormGroup>

                          {hasImage && (
                            <>
                              <FormGroup label={t('Image reference')} isRequired>
                                <TextField
                                  aria-label={t('Image reference')}
                                  name={`${volumeFieldName}.imageRef`}
                                  value={volume.imageRef || ''}
                                  isDisabled={isReadOnly}
                                  helperText={t('Provide a valid container image reference for the volume.')}
                                />
                              </FormGroup>

                              <FormGroupWithHelperText
                                label={t('Pull policy')}
                                content={
                                  <div>
                                    <p>
                                      <strong>{t('Pull options:')}</strong>
                                    </p>
                                    <ul>
                                      <li>
                                        <strong>{t('Always')}</strong> -{' '}
                                        {t('Attempts to always pull the latest image (uses more bandwidth)')}
                                      </li>
                                      <li>
                                        <strong>{t('If not present')}</strong> -{' '}
                                        {t('Pull only if missing locally (efficient)')}
                                      </li>
                                      <li>
                                        <strong>{t('Never')}</strong> -{' '}
                                        {t('Use cached images only (fastest, may fail)')}
                                      </li>
                                    </ul>
                                    <p>
                                      💡 <strong>{t('Trade-off:')}</strong> {t('Freshness vs. bandwidth efficiency.')}
                                    </p>
                                  </div>
                                }
                              >
                                <FormSelect
                                  name={`${volumeFieldName}.imagePullPolicy`}
                                  items={pullPolicyOptions}
                                  placeholderText={t('Select pull policy')}
                                  isDisabled={isReadOnly}
                                />
                              </FormGroupWithHelperText>
                            </>
                          )}

                          {hasMount && (
                            <FormGroup label={t('Mount path')} isRequired>
                              <TextField
                                aria-label={t('Mount path')}
                                name={`${volumeFieldName}.mountPath`}
                                value={volume.mountPath || ''}
                                isDisabled={isReadOnly}
                                helperText={t('Absolute path where the volume will be mounted on the container.')}
                              />
                            </FormGroup>
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
              <FormGroup className="pf-v5-u-mt-md">
                <Button
                  variant="link"
                  icon={<PlusCircleIcon />}
                  iconPosition="start"
                  onClick={() => {
                    push({
                      name: '',
                      volumeType: undefined,
                      imagePullPolicy: ImagePullPolicy.PullIfNotPresent,
                    });
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
