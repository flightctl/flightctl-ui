import * as React from 'react';

import {
  Button,
  Card,
  CardBody,
  ExpandableSection,
  Flex,
  FlexItem,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { AngleDownIcon } from '@patternfly/react-icons/dist/js/icons/angle-down-icon';
import { AngleRightIcon } from '@patternfly/react-icons/dist/js/icons/angle-right-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import {
  type ArrayFieldTemplateProps,
  type BaseInputTemplateProps,
  type FieldProps,
  type FieldTemplateProps,
  type ObjectFieldTemplateProps,
  type RegistryFieldsType,
} from '@rjsf/utils';
import { getDefaultRegistry } from '@rjsf/core';

import VolumeImageField, { ROOT_VOLUMES_IMAGE_FIELD_REGEX, getVolumeImageSourceMode } from './VolumeImageField';
import FieldErrors from './FieldErrors';
import { PFEmailWidget, PFPasswordWidget, PFTextWidget, PFURLWidget } from './FormWidget';
import { useTranslation } from '../../hooks/useTranslation';
import { FormGroupWithHelperText } from '../common/WithHelperText';
import { DefaultHelperText } from '../form/FieldHelperText';

/** When true, the object template should hide its title (used for array item objects). */
const DirectArrayItemContext = React.createContext<boolean>(false);

/**
 * Direct children of the form root (e.g. root_envVars, root_runAs, root_ports).
 * Relies on RJSF's "_" id separator and camelCase property names (no "_" in the name).
 */
const isRootLevelField = (schemaId: string) => /^root_[^_]+$/.test(schemaId);

// Get default fields from rjsf to use as fallbacks
const defaultRegistry = getDefaultRegistry();
const DefaultObjectField = defaultRegistry.fields.ObjectField;

type RootFieldWrapperProps = React.PropsWithChildren<{
  schemaId: string;
  title: string;
}>;

const RootFieldCard = ({ title, children }: React.PropsWithChildren<{ title: string }>) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <Card isCompact className="pf-v6-u-mb-md">
      <CardBody>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Button
              variant="plain"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? t('Collapse section') : t('Expand section')}
            >
              {isExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
            </Button>
          </FlexItem>
          <FlexItem className="pf-v6-u-font-weight-bold">{title}</FlexItem>
        </Flex>
        {isExpanded && children}
      </CardBody>
    </Card>
  );
};

// Wraps top level fields in a card to visually delineate each block
const RootFieldWrapper = ({ schemaId, title, children }: RootFieldWrapperProps) => {
  if (!isRootLevelField(schemaId)) {
    return children;
  }
  return <RootFieldCard title={title}>{children}</RootFieldCard>;
};

// Field Template - wraps each field with FormGroup (and a card for root-level fields)
const PFFieldTemplate = ({
  id,
  label,
  required,
  description,
  children,
  schema,
  displayLabel,
  rawErrors,
}: FieldTemplateProps) => {
  // Don't wrap object or array types with FormGroup - they handle their own layout
  if (schema.type === 'object' || schema.type === 'array') {
    return <>{children}</>;
  }

  const isRootLevel = isRootLevelField(id);
  // Title lives on the collapsible card header for root-level fields
  const showInlineLabel = !isRootLevel && schema.type !== 'boolean' && displayLabel;
  const fieldTitle = label || schema.title || id;

  return (
    <RootFieldWrapper schemaId={id} title={fieldTitle}>
      <FormGroup
        fieldId={id}
        label={showInlineLabel ? label : undefined}
        isRequired={showInlineLabel ? required : undefined}
      >
        {children}
        <DefaultHelperText helperText={description} />
        <FieldErrors errors={rawErrors} />
      </FormGroup>
    </RootFieldWrapper>
  );
};

// Object Field Template - layout for object properties using PatternFly FormFieldGroup
const PFObjectFieldTemplate = ({ title, description, properties, idSchema }: ObjectFieldTemplateProps) => {
  const isRoot = idSchema.$id === 'root';
  const isDirectArrayItem = React.useContext(DirectArrayItemContext);
  const titleOnCard = isRootLevelField(idSchema.$id);

  // For root, root-level card, or direct array item: render without nested title
  if (isRoot || isDirectArrayItem || titleOnCard) {
    const content = (
      <>
        {description && <DefaultHelperText helperText={description} />}
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

const CustomObjectField = (props: FieldProps) => {
  const { idSchema, schema, name, registry, rawErrors } = props;

  if (ROOT_VOLUMES_IMAGE_FIELD_REGEX.test(idSchema.$id)) {
    const mode = getVolumeImageSourceMode(registry.rootSchema);
    return (
      <div className="pf-v6-u-mb-md">
        <VolumeImageField {...props} mode={mode} />
        <FieldErrors errors={rawErrors} />
      </div>
    );
  }

  const title = (typeof schema.title === 'string' && schema.title) || name || idSchema.$id;

  return (
    <RootFieldWrapper schemaId={idSchema.$id} title={title}>
      <DefaultObjectField {...props} />
    </RootFieldWrapper>
  );
};

// Custom fields registry
const pfFields: RegistryFieldsType = {
  ObjectField: CustomObjectField,
};

// Array Field Template - each array item is an expandable section (aligned with ExpandableFormSection)
const PFArrayFieldTemplate = ({ title, items, canAdd, onAddClick, idSchema, rawErrors }: ArrayFieldTemplateProps) => {
  const { t } = useTranslation();
  const sectionTitle = title || t('Items');
  const isRootLevel = isRootLevelField(idSchema.$id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <RootFieldWrapper schemaId={idSchema.$id} title={sectionTitle}>
      <FormGroup fieldId={idSchema.$id} label={isRootLevel ? undefined : sectionTitle}>
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
                      isDanger
                      icon={<MinusCircleIcon />}
                      iconPosition="start"
                      onClick={item.onDropIndexClick(item.index)}
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
    </RootFieldWrapper>
  );
};

// Base Input Template
const BaseInputTemplate = (props: BaseInputTemplateProps) => {
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
