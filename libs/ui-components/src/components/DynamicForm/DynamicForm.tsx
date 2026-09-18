import * as React from 'react';
import Form from '@rjsf/core';
import { type RJSFSchema, type RegistryWidgetsType, type TemplatesType } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import type AJV8Validator from '@rjsf/validator-ajv8/lib/validator';

import {
  PFCheckboxWidget,
  PFEmailWidget,
  PFNumberWidget,
  PFPasswordWidget,
  PFSelectWidget,
  PFTextWidget,
  PFTextareaWidget,
  PFURLWidget,
} from './FormWidget';
import {
  BaseInputTemplate,
  PFArrayFieldTemplate,
  PFFieldTemplate,
  PFObjectFieldTemplate,
  pfFields,
} from './FieldTemplate';

// All PatternFly widgets
const pfWidgets: RegistryWidgetsType = {
  TextWidget: PFTextWidget,
  TextareaWidget: PFTextareaWidget,
  CheckboxWidget: PFCheckboxWidget,
  SelectWidget: PFSelectWidget,
  UpDownWidget: PFNumberWidget,
  PasswordWidget: PFPasswordWidget,
  EmailWidget: PFEmailWidget,
  URLWidget: PFURLWidget,
};

// All PatternFly templates
const pfTemplates: Partial<TemplatesType<Record<string, unknown>, RJSFSchema>> = {
  FieldTemplate: PFFieldTemplate,
  ObjectFieldTemplate: PFObjectFieldTemplate,
  ArrayFieldTemplate: PFArrayFieldTemplate,
  BaseInputTemplate,
};

type DynamicFormProps = {
  valuesSchema: RJSFSchema;
  formData: Record<string, unknown> | undefined;
  onChange: (data: Record<string, unknown> | undefined) => void;
  onValidate?: (isValid: boolean) => void;
};

const DynamicForm = ({ valuesSchema, formData, onChange, onValidate }: DynamicFormProps) => {
  return (
    <Form<Record<string, unknown>>
      schema={valuesSchema}
      formData={formData}
      validator={validator as AJV8Validator<Record<string, unknown>, RJSFSchema>}
      widgets={pfWidgets}
      templates={pfTemplates}
      fields={pfFields}
      onChange={(e) => {
        onChange(e.formData);
        onValidate?.(e.errors.length === 0);
      }}
      liveValidate
      showErrorList={false}
      tagName="div"
    >
      {/* Hide default submit button */}
      <></>
    </Form>
  );
};

export default DynamicForm;
