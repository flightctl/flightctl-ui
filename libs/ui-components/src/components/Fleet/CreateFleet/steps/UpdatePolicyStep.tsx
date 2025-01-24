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
import { FieldArray, FormikErrors, useField, useFormikContext } from 'formik';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons';

import { BatchForm, BatchLimitType, FleetFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import FlightCtlForm from '../../../form/FlightCtlForm';
import CheckboxField from '../../../form/CheckboxField';
import ErrorHelperText from '../../../form/FieldHelperText';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import LabelsField from '../../../form/LabelsField';
import FormSelect from '../../../form/FormSelect';
import NumberField from '../../../form/NumberField';
import WithHelperText from '../../../common/WithHelperText';

export const updatePolicyStepId = 'update-policy';

export const isUpdatePolicyStepValid = (errors: FormikErrors<FleetFormValues>) => !errors.rolloutPolicy;

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
          <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsFlexEnd' }}>
            <FlexItem>
              <FormSelect items={items} name={`rolloutPolicy.batches.${index}.limitType`} />
            </FlexItem>
            <FlexItem>
              <NumberField
                aria-label={t('Numeric selector')}
                name={`rolloutPolicy.batches.${index}.limit`}
                min={1}
                max={isPercent ? 100 : undefined}
                widthChars={isPercent ? 3 : 8}
              />
            </FlexItem>
            {isPercent && <FlexItem>%</FlexItem>}
          </Flex>
        </FormGroup>
        <FormGroup
          isRequired
          label={
            <WithHelperText
              ariaLabel={t('Success threshold')}
              content={t(
                'Minimum percentage of devices that must update successfully in order to continue updating the next batch of devices.',
              )}
              showLabel
            />
          }
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
              {t("% of the batch devices pass the success criteria, move to next batch or the rest of fleet's devices")}
              .
            </FlexItem>
          </Flex>
        </FormGroup>
      </Grid>
    </ExpandableFormSection>
  );
};

const RolloutPolicies = () => {
  const { t } = useTranslation();

  const { values } = useFormikContext<FleetFormValues>();

  const batches = values.rolloutPolicy.batches || [];

  return (
    <>
      <FormGroup
        isRequired
        label={
          <WithHelperText
            ariaLabel={t('Update timeout')}
            content={t(
              "If the device does not update within this timeout, the device will be counted as a failure to its batch's success.",
            )}
            showLabel
          />
        }
      >
        <Flex>
          <FlexItem>{t('Timeout devices if they did not complete the update after')} </FlexItem>
          <FlexItem>
            <NumberField aria-label={t('Update timeout')} name={`rolloutPolicy.updateTimeout`} min={1} isRequired />
          </FlexItem>
          <FlexItem>{t('minutes')}.</FlexItem>
        </Flex>
      </FormGroup>

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
                      push({
                        limit: '',
                        limitType: BatchLimitType.BatchLimitPercent,
                        selector: [],
                        successThreshold: '',
                      });
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

const UpdatePolicyStep = () => {
  const { t } = useTranslation();

  const {
    values: { rolloutPolicy },
    setFieldValue,
  } = useFormikContext<FleetFormValues>();

  const onChangePolicyType = React.useCallback(
    (isActive: boolean) => {
      setFieldValue(
        'rolloutPolicy.batches',
        isActive
          ? [
              {
                limit: '',
                limitType: BatchLimitType.BatchLimitPercent,
                successThreshold: '',
                selector: [],
              },
            ]
          : [],
      );
    },
    [setFieldValue],
  );

  return (
    <Grid span={8}>
      <FlightCtlForm>
        <FormGroup>
          <CheckboxField
            name="rolloutPolicy.isActive"
            label={t('Use advanced configurations')}
            onChangeCustom={onChangePolicyType}
          />
        </FormGroup>
        {rolloutPolicy.isActive ? (
          <FormSection title={t('Rollout policies')} titleElement="h1">
            <Alert isInline variant="info" title={t('Batch sequencing')}>
              {t('Batches will be applied from first to last.')}
              <br />
              {t('Devices that are not part of any batch will be updated last.')}
            </Alert>
            <RolloutPolicies />
          </FormSection>
        ) : (
          <Alert isInline variant="info" title={t('Default update policy')}>
            {t('All the devices that are part of this fleet will receive updates as soon as they are available.')}
          </Alert>
        )}
      </FlightCtlForm>
    </Grid>
  );
};

export default UpdatePolicyStep;
