import * as React from 'react';

import {
  Button,
  ExpandableSection,
  FormGroup,
  FormHelperText,
  FormSection,
  Grid,
  GridItem,
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

import VolumeImageField, { ROOT_VOLUMES_IMAGE_REFERENCE_FIELD_REGEX } from './VolumeImageField';
import FieldErrors from './FieldErrors';
import { PFEmailWidget, PFPasswordWidget, PFTextWidget, PFURLWidget } from './FormWidget';
import { useTranslation } from '../../hooks/useTranslation';
import { DynamicFormContext } from './DynamicForm';
import { FormGroupWithHelperText } from '../common/WithHelperText';

/** When true, the object template should hide its title (used for array item objects). */
const DirectArrayItemContext = React.createContext<boolean>(false);

// Get default fields from rjsf to use as fallbacks
const defaultRegistry = getDefaultRegistry();
const DefaultObjectField = defaultRegistry.fields.ObjectField;
const DefaultStringField = defaultRegistry.fields.StringField;

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
  rawErrors,
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
        <FieldErrors errors={rawErrors} />
      </FormGroup>
    );
  }

  return (
    <FormGroup fieldId={id} label={displayLabel ? label : undefined} isRequired={required}>
      {children}
      <DescriptionText description={description} />
      <FieldErrors errors={rawErrors} />
    </FormGroup>
  );
};

// Object Field Template - layout for object properties using PatternFly FormFieldGroup
const PFObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = ({ title, description, properties, idSchema }) => {
  const isRoot = idSchema.$id === 'root';
  const isDirectArrayItem = React.useContext(DirectArrayItemContext);

  // For root or direct array item object, render without title (array template already shows item title)
  if (isRoot || isDirectArrayItem) {
    const content = (
      <>
        {description && <DescriptionText description={description} />}
        {properties.map((prop) => (
          <React.Fragment key={prop.name}>{prop.content}</React.Fragment>
        ))}
      </>
    );
    return isDirectArrayItem ? (
      <DirectArrayItemContext.Provider value={false}>{content}</DirectArrayItemContext.Provider>
    ) : (
      content
    );
  }

  // For other nested objects, use FormSection with title
  return (
    <FormSection>
      <FormGroupWithHelperText label={title} content={description}>
        <Grid hasGutter>
          {properties.map((prop) => (
            <GridItem key={prop.name}>{prop.content}</GridItem>
          ))}
        </Grid>
      </FormGroupWithHelperText>
    </FormSection>
  );
};

// Custom Object Field - can be extended for other special object types
const CustomObjectField: React.FC<FieldProps> = (props) => {
  return <DefaultObjectField {...props} />;
};

// Custom String Field - use VolumeImageField for volume image reference only
const CustomStringField: React.FC<FieldProps> = (props) => {
  const { idSchema, schema } = props;

  if (schema.type === 'string' && ROOT_VOLUMES_IMAGE_REFERENCE_FIELD_REGEX.test(idSchema.$id)) {
    return <VolumeImageField {...props} />;
  }

  return <DefaultStringField {...props} />;
};

// Custom fields registry
const pfFields: RegistryFieldsType = {
  ObjectField: CustomObjectField,
  StringField: CustomStringField,
};

// Array Field Template - each array item is an expandable section (aligned with ExpandableFormSection)
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
  const sectionTitle = title || t('Items');
  const [expandedItems, setExpandedItems] = React.useState<Record<number, boolean>>(() =>
    items.reduce<Record<number, boolean>>((acc, item) => {
      acc[item.index] = true;
      return acc;
    }, {}),
  );

  // Keep expanded state in sync when items are added/removed
  React.useEffect(() => {
    setExpandedItems((prev) => {
      const next = { ...prev };
      items.forEach((item) => {
        if (next[item.index] === undefined) next[item.index] = true;
      });
      return next;
    });
  }, [items.length]);

  return (
    <FormGroup fieldId={idSchema.$id} label={sectionTitle}>
      <Grid hasGutter>
        {items.map((item) => (
          <GridItem key={item.index}>
            <Split hasGutter>
              <SplitItem isFilled>
                <ExpandableSection
                  key={item.key}
                  toggleContent={`${sectionTitle} ${item.index + 1}`}
                  isIndented
                  isExpanded={expandedItems[item.index] !== false}
                  onToggle={(_, expanded) => {
                    setExpandedItems((prev) => ({ ...prev, [item.index]: expanded }));
                  }}
                >
                  <DirectArrayItemContext.Provider value={true}>{item.children}</DirectArrayItemContext.Provider>
                </ExpandableSection>
              </SplitItem>
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
          </GridItem>
        ))}
        {canAdd && (
          <GridItem>
            <Button variant="link" icon={<PlusCircleIcon />} iconPosition="start" onClick={onAddClick}>
              {t('Add item')}
            </Button>
          </GridItem>
        )}
        <GridItem>
          <FieldErrors errors={rawErrors} />
        </GridItem>
      </Grid>
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
