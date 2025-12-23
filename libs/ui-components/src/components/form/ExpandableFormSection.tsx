import * as React from 'react';
import { ExpandableSection, ExpandableSectionProps, Split, SplitItem } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { useField, useFormikContext } from 'formik';

import { useTranslation } from '../../hooks/useTranslation';
import WithTooltip from '../common/WithTooltip';

const ExpandableFormSection = ({
  fieldName,
  title,
  description,
  children,
}: {
  fieldName: string;
  title: string;
  description?: string;
  children: ExpandableSectionProps['children'];
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { setFieldTouched } = useFormikContext();
  const [, { error }, { setTouched }] = useField(fieldName);

  return (
    <ExpandableSection
      toggleContent={
        <Split hasGutter>
          <SplitItem>{title}</SplitItem>
          {!isExpanded && !!description && (
            <SplitItem
              style={{
                color: 'var(--pf-t--global--text--color--regular)',
              }}
            >
              {description}
            </SplitItem>
          )}
          {!isExpanded && error && (
            <SplitItem>
              <WithTooltip showTooltip content={t('Invalid {{ itemType }}', { itemType: title })}>
                <ExclamationCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }} />
              </WithTooltip>
            </SplitItem>
          )}
        </Split>
      }
      isIndented
      isExpanded={isExpanded}
      onToggle={(_, expanded) => {
        setTouched(true);
        Object.keys((error as unknown as object) || {}).forEach((key) => {
          setFieldTouched(`${fieldName}.${key}`, true);
        });
        setIsExpanded(expanded);
      }}
    >
      {children}
    </ExpandableSection>
  );
};

export default ExpandableFormSection;
