import * as React from 'react';
import {
  Card,
  CardBody,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  FormSection,
  Radio,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { BindingType } from '@flightctl/types/imagebuilder';
import { ImageBuildFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { CERTIFICATE_VALIDITY_IN_YEARS } from '../../../../constants';

export const registrationStepId = 'registration';

export const isRegistrationStepValid = (errors: FormikErrors<ImageBuildFormValues>) => !errors.bindingType;

const RegistrationStep = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<ImageBuildFormValues>();

  const isEarlyBindingSelected = values.bindingType === BindingType.BindingTypeEarly;

  const handleEarlyBindingSelect = () => {
    if (values.bindingType !== BindingType.BindingTypeEarly) {
      setFieldValue('bindingType', BindingType.BindingTypeEarly);
    }
  };

  const handleLateBindingSelect = () => {
    if (values.bindingType !== BindingType.BindingTypeLate) {
      setFieldValue('bindingType', BindingType.BindingTypeLate);
    }
  };

  return (
    <FlightCtlForm>
      <FormSection>
        <Card onClick={handleEarlyBindingSelect}>
          <CardBody>
            <Stack hasGutter>
              <StackItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Radio
                      id="binding-early"
                      name="binding-type"
                      aria-label={t('Early binding')}
                      isChecked={isEarlyBindingSelected}
                      onChange={handleEarlyBindingSelect}
                    />
                  </FlexItem>
                  <FlexItem>
                    <Title headingLevel="h3" size="md">
                      {t('Early binding')}
                    </Title>
                  </FlexItem>
                </Flex>
              </StackItem>
              <StackItem>
                <Content>
                  {t(
                    'This image is automatically secured. Register it within {{ validityPeriod }} years to keep it active.',
                    { validityPeriod: CERTIFICATE_VALIDITY_IN_YEARS, count: CERTIFICATE_VALIDITY_IN_YEARS },
                  )}
                </Content>
              </StackItem>

              {isEarlyBindingSelected && (
                <>
                  <StackItem>
                    <Divider />
                  </StackItem>
                  <StackItem>
                    <Stack hasGutter>
                      <StackItem>
                        <DescriptionList isHorizontal>
                          <DescriptionListGroup>
                            <DescriptionListTerm>{t('Enrollment')}</DescriptionListTerm>
                            <DescriptionListDescription>{t('Auto-create certificate')}</DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>{t('Registration')}</DescriptionListTerm>
                            <DescriptionListDescription>
                              {t('{{ validityPeriod }} years (Standard)', {
                                validityPeriod: CERTIFICATE_VALIDITY_IN_YEARS,
                                count: CERTIFICATE_VALIDITY_IN_YEARS,
                              })}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        </DescriptionList>
                      </StackItem>
                    </Stack>
                  </StackItem>
                </>
              )}
            </Stack>
          </CardBody>
        </Card>

        <Card onClick={handleLateBindingSelect}>
          <CardBody>
            <Stack hasGutter>
              <StackItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Radio
                      id="binding-late"
                      name="binding-type"
                      aria-label={t('Late binding')}
                      isChecked={!isEarlyBindingSelected}
                      onChange={handleLateBindingSelect}
                    />
                  </FlexItem>
                  <FlexItem>
                    <Title headingLevel="h3" size="md">
                      {t('Late binding')}
                    </Title>
                  </FlexItem>
                </Flex>
              </StackItem>
              <StackItem>
                <Content>
                  {t('No additional user input required (cloud-init and ignition are enabled automatically)')}
                </Content>
              </StackItem>
            </Stack>
          </CardBody>
        </Card>
      </FormSection>
    </FlightCtlForm>
  );
};

export default RegistrationStep;
