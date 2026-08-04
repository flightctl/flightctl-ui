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
import type { VolumeCatalogSelection } from '../../utils/catalog';

export type DynamicFormContext = {
  volumeSelection: VolumeCatalogSelection[];
  onVolumeSelected: (selection: VolumeCatalogSelection) => void;
  /** Called when an array item is removed, before the form state is updated. Use to sync e.g. volumeSelection when the array is "volumes". */
  onBeforeArrayItemRemoved: (arrayId: string, index: number) => void;
  /** Called when the user clears the catalog item selection for a volume (e.g. "Delete Item"). Use to remove the entry from volumeSelection. */
  onVolumeCleared: (volumeIndex: number) => void;
};

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
  formContext?: DynamicFormContext;
};

const DynamicForm = ({ valuesSchema, formData, onChange, onValidate, formContext }: DynamicFormProps) => {
  return (
    <Form<Record<string, unknown>>
      schema={valuesSchema}
      formData={formData}
      validator={validator as AJV8Validator<Record<string, unknown>, RJSFSchema, DynamicFormContext>}
      widgets={pfWidgets}
      templates={pfTemplates}
      fields={pfFields}
      formContext={formContext}
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
