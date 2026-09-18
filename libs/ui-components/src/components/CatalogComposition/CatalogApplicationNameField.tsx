import * as React from 'react';
import { Button, Content, ContentVariants, Flex, FlexItem, FormGroup, Icon } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../hooks/useTranslation';
import TextField from '../form/TextField';

const CatalogApplicationNameField = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = React.useState(false);
  const { values, errors, submitCount, setFieldValue } = useFormikContext<{ appName: string }>();
  const [acceptedAppName, setAcceptedAppName] = React.useState(values.appName);

  const updatedName = values.appName;
  const hasError = !!errors.appName;

  const cancelEditing = React.useCallback(() => {
    if (!hasError && acceptedAppName) {
      void setFieldValue('appName', acceptedAppName, false);
      setIsEditing(false);
    }
  }, [hasError, acceptedAppName, setFieldValue]);

  const acceptEditing = React.useCallback(() => {
    if (!hasError && updatedName) {
      setAcceptedAppName(updatedName);
      setIsEditing(false);
    }
  }, [hasError, updatedName]);

  React.useEffect(() => {
    if (submitCount > 0 && errors.appName) {
      setIsEditing(true);
    }
  }, [submitCount, errors.appName]);

  // Capture Escape before PatternFly Modal closes the dialog.
  React.useEffect(() => {
    if (!isEditing) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      cancelEditing();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isEditing, cancelEditing]);

  return (
    <FormGroup label={t('Application name')} isRequired fieldId="catalog-app-name">
      {isEditing ? (
        <TextField
          name="appName"
          aria-label={t('Application name')}
          helperText={t('Must be unique within this template.')}
          onBlur={acceptEditing}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              acceptEditing();
            }
          }}
        />
      ) : (
        <>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <FlexItem>
              <Content component={ContentVariants.p}>{updatedName}</Content>
            </FlexItem>
            <FlexItem>
              <Button
                variant="link"
                aria-label={t('Edit name')}
                onClick={() => setIsEditing(true)}
                icon={
                  <Icon size="sm">
                    <PencilAltIcon />
                  </Icon>
                }
              />
            </FlexItem>
          </Flex>
        </>
      )}
    </FormGroup>
  );
};

export default CatalogApplicationNameField;
