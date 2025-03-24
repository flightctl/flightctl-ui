import * as React from 'react';
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { FieldArray, useField, useFormikContext } from 'formik';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons';

import { BatchForm, BatchLimitType, FleetFormValues } from '../../../../types/deviceSpec';
import ErrorHelperText from '../../../form/FieldHelperText';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import LabelsField from '../../../form/LabelsField';
import FormSelect from '../../../form/FormSelect';
import NumberField from '../../../form/NumberField';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getEmptyInitializedBatch } from '../fleetSpecUtils';

const RolloutPolicyBatch = ({ index }: { index: number }) => {
  const { t } = useTranslation();

  const items = React.useMemo(
    () => ({
      percent: t('Percentage'),
      value: t('Number of devices'),
    }),
    [t],
  );

  const [{ value: batch }, meta] = useField<BatchForm>(`rolloutPolicy.batches.${index}`);

  const isPercent = batch.limitType === BatchLimitType.BatchLimitPercent;
  return (
    <ExpandableFormSection
      title={t('Batch {{ batchNum }}', { batchNum: index + 1 })}
      fieldName={`rolloutPolicy.batches.${index}`}
    >
      <Grid hasGutter>
        {/* Show errors not related to an individual field */}
        {typeof meta.error === 'string' && (
          <GridItem>
            <ErrorHelperText meta={meta} />
          </GridItem>
        )}
        <FormGroup label={t('Select devices using labels')}>
          <LabelsField aria-label={t('Label selector')} name={`rolloutPolicy.batches.${index}.selector`} />
        </FormGroup>
        <FormGroup label={t('Select a subset using')}>
          <Split hasGutter>
            <SplitItem>
              <FormSelect items={items} name={`rolloutPolicy.batches.${index}.limitType`} />
            </SplitItem>
            <SplitItem>
              <NumberField
                aria-label={t('Numeric selector')}
                name={`rolloutPolicy.batches.${index}.limit`}
                min={1}
                max={isPercent ? 100 : undefined}
                widthChars={isPercent ? 3 : 8}
                unit={isPercent ? '%' : undefined}
              />
            </SplitItem>
          </Split>
        </FormGroup>
        <FormGroupWithHelperText
          label={t('Success threshold')}
          content={t(
            'The minimum percentage of devices that must be updated successfully in order to continue updating the next batch of devices.',
          )}
          isRequired
        >
          <Flex flexWrap={{ default: 'wrap' }}>
            <FlexItem>{t('If')} </FlexItem>
            <FlexItem>
              <NumberField
                aria-label={t('Success threshold')}
                name={`rolloutPolicy.batches.${index}.successThreshold`}
                min={1}
                max={100}
                isRequired
              />
            </FlexItem>
            <FlexItem flex={{ lg: 'flex_1' }} style={{ minWidth: 200 }}>
              {t(
                "% of the batch devices pass the success threshold, move to next batch or the rest of fleet's devices.",
              )}
            </FlexItem>
          </Flex>
        </FormGroupWithHelperText>
      </Grid>
    </ExpandableFormSection>
  );
};

const UpdateStepRolloutPolicy = () => {
  const { t } = useTranslation();

  const {
    values: { rolloutPolicy },
  } = useFormikContext<FleetFormValues>();

  const batches = rolloutPolicy.batches || [];

  return (
    <>
      <Alert isInline variant="info" title={t('Batch sequencing')}>
        {t('Batches will be applied from first to last.')}
        <br />
        {t('Devices that are not part of any batch will be updated last.')}
      </Alert>
      <FormGroupWithHelperText
        label={t('Update timeout')}
        content={t(
          "The time-frame within which a device must be updated. If it exceeds it, device will be counted as a 'failed to update' in the batch success threshold.",
        )}
        isRequired
      >
        <Flex>
          <FlexItem>{t('Timeout devices that fail to update after')}</FlexItem>
          <FlexItem>
            <NumberField aria-label={t('Update timeout')} name="rolloutPolicy.updateTimeout" min={1} isRequired />
          </FlexItem>
          <FlexItem>{t('minutes')}.</FlexItem>
        </Flex>
      </FormGroupWithHelperText>

      <FormGroup>
        <FieldArray name="rolloutPolicy.batches">
          {({ push, remove }) => (
            <>
              {batches.map((_, index) => (
                <FormSection key={index}>
                  <Split hasGutter>
                    <SplitItem isFilled>
                      <RolloutPolicyBatch index={index} />
                    </SplitItem>
                    <SplitItem>
                      <Button
                        aria-label={t('Delete batch')}
                        variant="link"
                        icon={<MinusCircleIcon />}
                        iconPosition="start"
                        onClick={() => remove(index)}
                        isDisabled={batches.length === 1}
                      />
                    </SplitItem>
                  </Split>
                </FormSection>
              ))}
              <FormSection>
                <FormGroup>
                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    iconPosition="start"
                    onClick={() => {
                      push(getEmptyInitializedBatch());
                    }}
                  >
                    {t('Add batch')}
                  </Button>
                </FormGroup>
              </FormSection>
            </>
          )}
        </FieldArray>
      </FormGroup>
    </>
  );
};

export default UpdateStepRolloutPolicy;
