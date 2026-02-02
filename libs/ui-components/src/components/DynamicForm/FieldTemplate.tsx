import * as React from 'react';

import {
  Button,
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import {
  ArrayFieldTemplateProps,
  BaseInputTemplateProps,
  FieldProps,
  FieldTemplateProps,
  ObjectFieldTemplateProps,
  RegistryFieldsType,
} from '@rjsf/utils';
import { getDefaultRegistry } from '@rjsf/core';
import VolumeImageField from './VolumeImageField';

// Get the default ObjectField from rjsf to use as fallback
const defaultRegistry = getDefaultRegistry();
const DefaultObjectField = defaultRegistry.fields.ObjectField;
import FieldErrors from './FieldErrors';
import { PFEmailWidget, PFPasswordWidget, PFTextWidget, PFURLWidget } from './FormWidget';
import { useTranslation } from '../../hooks/useTranslation';
import { DynamicFormContext } from './DynamicForm';

// Helper component for description text
const DescriptionText = ({ description }: { description?: React.ReactNode }) =>
  !!description && (
    <FormHelperText>
      <HelperText>
        <HelperTextItem variant="default">{description}</HelperTextItem>
      </HelperText>
    </FormHelperText>
  );

// Field Template - wraps each field with FormGroup
const PFFieldTemplate: React.FC<FieldTemplateProps> = ({
  id,
  label,
  required,
  description,
  children,
  schema,
  displayLabel,
}) => {
  // Don't wrap object or array types with FormGroup - they handle their own layout
  if (schema.type === 'object' || schema.type === 'array') {
    return <>{children}</>;
  }

  // Checkbox handles its own label
  if (schema.type === 'boolean') {
    return (
      <FormGroup fieldId={id}>
        {children}
        <DescriptionText description={description} />
      </FormGroup>
    );
  }

  return (
    <FormGroup fieldId={id} label={displayLabel ? label : undefined} isRequired={required}>
      {children}
      <DescriptionText description={description} />
    </FormGroup>
  );
};

// Object Field Template - layout for object properties using PatternFly FormFieldGroup
const PFObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({ title, description, properties, idSchema }) => {
  const isRoot = idSchema.$id === 'root';

  // For root level, render without the FormFieldGroup wrapper
  if (isRoot) {
    return (
      <>
        {description && <DescriptionText description={description} />}
        {properties.map((prop) => (
          <React.Fragment key={prop.name}>{prop.content}</React.Fragment>
        ))}
      </>
    );
  }

  // For nested objects, use FormFieldGroup
  return (
    <FormSection title={title} titleElement="h2">
      {description && <DescriptionText description={description} />}
      {properties.map((prop) => (
        <React.Fragment key={prop.name}>{prop.content}</React.Fragment>
      ))}
    </FormSection>
  );
};

/**
 * Checks if the current field is an "image" object inside a volumes array item.
 * The id pattern would be like: root_volumes_0_image, root_volumes_1_image, etc.
 */
const isVolumeImageField = (id: string): boolean => {
  // Match pattern: root_volumes_<index>_image
  return /^root_volumes_\d+_image$/.test(id);
};

// Custom Object Field - checks for special field types and renders custom fields
const CustomObjectField: React.FC<FieldProps> = (props) => {
  const { idSchema, schema } = props;

  // Check if this is an "image" object inside a volumes array item
  if (isVolumeImageField(idSchema.$id) && schema.type === 'object') {
    return <VolumeImageField {...props} />;
  }

  // Fall back to the default ObjectField from rjsf (not from registry to avoid infinite loop)
  return <DefaultObjectField {...props} />;
};

// Custom fields registry
const pfFields: RegistryFieldsType = {
  ObjectField: CustomObjectField,
};

// Array Field Template
const PFArrayFieldTemplate: React.FC<ArrayFieldTemplateProps> = ({
  title,
  items,
  canAdd,
  onAddClick,
  idSchema,
  rawErrors,
  formContext,
}) => {
  const { t } = useTranslation();
  const onBeforeArrayItemRemoved = (formContext as DynamicFormContext)?.onBeforeArrayItemRemoved;
  return (
    <FormGroup fieldId={idSchema.$id} label={title}>
      {items.map((item) => (
        <FormSection key={item.key}>
          <Split hasGutter>
            <SplitItem isFilled>{item.children}</SplitItem>
            {item.hasRemove && (
              <SplitItem>
                <Button
                  aria-label={t('Delete item')}
                  variant="link"
                  icon={<MinusCircleIcon />}
                  iconPosition="start"
                  onClick={() => {
                    onBeforeArrayItemRemoved?.(idSchema.$id, item.index);
                    item.onDropIndexClick(item.index)();
                  }}
                />
              </SplitItem>
            )}
          </Split>
        </FormSection>
      ))}
      {canAdd && (
        <FormSection>
          <FormGroup>
            <Button variant="link" icon={<PlusCircleIcon />} iconPosition="start" onClick={onAddClick}>
              {t('Add item')}
            </Button>
          </FormGroup>
        </FormSection>
      )}
      <FieldErrors errors={rawErrors} />
    </FormGroup>
  );
};

// Base Input Template
const BaseInputTemplate: React.FC<BaseInputTemplateProps> = (props) => {
  const { type } = props;

  switch (type) {
    case 'password':
      return <PFPasswordWidget {...props} />;
    case 'email':
      return <PFEmailWidget {...props} />;
    case 'url':
      return <PFURLWidget {...props} />;
    default:
      return <PFTextWidget {...props} />;
  }
};

export { PFFieldTemplate, PFObjectFieldTemplate, PFArrayFieldTemplate, BaseInputTemplate, pfFields };
