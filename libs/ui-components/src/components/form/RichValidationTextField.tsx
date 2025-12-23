import * as React from 'react';
import { useField } from 'formik';
import {
  Button,
  FormGroup,
  HelperText,
  HelperTextItem,
  HelperTextItemProps,
  InputGroup,
  InputGroupItem,
  Popover,
  PopoverPosition,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons/dist/js/icons/times-icon';
import { CheckIcon } from '@patternfly/react-icons/dist/js/icons/check-icon';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';

import dangerColor from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_danger_default';
import successColor from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_success_default';
import infoColor from '@patternfly/react-tokens/dist/js/t_global_color_nonstatus_blue_300';

interface RichValidationStatusProps {
  validations: RichValidationTextFieldProps['validations'];
  metaError?: string | Record<string, string>;
  isRequired: boolean;
  hasValue: boolean;
}
const RichValidationStatus = ({ isRequired, hasValue, validations, metaError }: RichValidationStatusProps) => {
  const showRequiredError = isRequired && !hasValue;
  return (
    <HelperText component="ul">
      {validations.map((validation) => {
        let hasError = false;
        // For each validation entry, we check if there's an error with the same key
        if (metaError !== undefined && typeof metaError !== 'string') {
          hasError = metaError?.[validation.key] === 'failed';
        }

        let iconType: HelperTextItemProps['icon'];
        let variant: HelperTextItemProps['variant'];

        if (showRequiredError) {
          variant = 'indeterminate';
        } else if (hasError) {
          iconType = <TimesIcon />;
          variant = 'error';
        } else {
          variant = 'success';
          iconType = <CheckIcon />;
        }

        return (
          <HelperTextItem key={validation.key} component="li" variant={variant} icon={iconType}>
            {validation.message}
          </HelperTextItem>
        );
      })}
    </HelperText>
  );
};

export interface RichValidationTextFieldProps extends TextInputProps {
  fieldName: string;
  isRequired?: boolean;
  validations: {
    key: string;
    message: string;
  }[];
}

const RichValidationTextField = React.forwardRef(
  (
    { fieldName, validations, isRequired, onBlur, ...rest }: RichValidationTextFieldProps,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const [popoverOpen, setPopoverOpen] = React.useState(false);

    const [field, meta, { setTouched }] = useField({
      name: fieldName,
    });

    const fieldId = `rich-validation-field-${fieldName}`;
    const hasValue = !!field.value;

    return (
      <FormGroup label={rest?.['aria-label']} id={`form-control__${fieldId}`} fieldId={fieldId} isRequired={isRequired}>
        <InputGroup>
          <InputGroupItem isFill>
            <TextInput
              {...field}
              {...rest}
              id={fieldId}
              ref={ref}
              isRequired={isRequired}
              aria-describedby={`${fieldId}-helper`}
              onChange={async (event, val) => {
                !popoverOpen && setPopoverOpen(true);
                field.onChange(event);
                // TODO does not work well for the first character
                if (!meta.touched && val?.length) {
                  await setTouched(true, true);
                }
              }}
              onBlur={() => {
                setPopoverOpen(false);
                void setTouched(true, true);
                if (onBlur) {
                  onBlur();
                }
              }}
            />
          </InputGroupItem>
          <InputGroupItem>
            <Popover
              isVisible={popoverOpen}
              shouldClose={() => setPopoverOpen(false)}
              shouldOpen={() => setPopoverOpen(true)}
              aria-label="validation popover"
              position={PopoverPosition.top}
              bodyContent={
                <RichValidationStatus
                  hasValue={hasValue}
                  isRequired={isRequired || false}
                  validations={validations}
                  metaError={meta.error}
                />
              }
              withFocusTrap={false}
            >
              <Button
                icon={
                  !hasValue ? (
                    <InfoCircleIcon color={infoColor.value} />
                  ) : !!meta.error ? (
                    <ExclamationCircleIcon color={dangerColor.value} />
                  ) : (
                    <CheckCircleIcon color={successColor.value} />
                  )
                }
                variant="plain"
                aria-label="Validation"
              />
            </Popover>
          </InputGroupItem>
        </InputGroup>
      </FormGroup>
    );
  },
);

RichValidationTextField.displayName = 'RichValidationTextField';

const RichValidationTextFieldWrapper = React.forwardRef(
  ({ fieldName, isDisabled, ...rest }: RichValidationTextFieldProps, ref: React.Ref<HTMLInputElement>) => {
    const [field] = useField<string>({
      name: fieldName,
    });
    if (isDisabled) {
      return (
        <FormGroup label={rest?.['aria-label']} isRequired={rest.isRequired}>
          <TextInput value={field.value} {...rest} isDisabled />
        </FormGroup>
      );
    }

    return <RichValidationTextField ref={ref} fieldName={fieldName} {...rest} />;
  },
);

RichValidationTextFieldWrapper.displayName = 'RichValidationTextFieldWrapper';

export default RichValidationTextFieldWrapper;
