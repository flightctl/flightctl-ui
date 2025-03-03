import * as React from 'react';
import { Alert, Button, Grid, GridItem, Icon } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';
import { Formik, FormikErrors, FormikState } from 'formik';
import * as Yup from 'yup';

import { Device, PatchRequest } from '@flightctl/types';
import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { getErrorMessage } from '../../../utils/error';
import RichValidationTextField from '../../form/RichValidationTextField';
import { getLabelValueValidations, validKubernetesLabelValue } from '../../form/validations';

type DeviceAliasEditProps = { deviceId: string; alias?: string; onAliasEdited: VoidFunction };
type DeviceAliasEditValues = { alias: string };

const DeviceAliasEdit = ({ deviceId, alias: originalAlias = '', onAliasEdited }: DeviceAliasEditProps) => {
  const { t } = useTranslation();
  const { patch } = useFetch();

  const textInputRef = React.useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = React.useState<boolean>();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>();
  const [submitError, setSubmitError] = React.useState<string>();

  const toggleIsEditing = () => {
    setIsEditing((wasEditing) => !wasEditing);
  };

  React.useEffect(() => {
    // Focus the field after it became editable - before that, the input is not rendered
    if (isEditing) {
      textInputRef?.current?.focus();
    }
  }, [isEditing]);

  const onSubmit = React.useCallback(
    async ({ alias }: DeviceAliasEditValues) => {
      if (alias === originalAlias) {
        toggleIsEditing();
        return;
      }
      const req: PatchRequest = alias
        ? [
            {
              path: '/metadata/labels/alias',
              op: 'replace',
              value: alias,
            },
          ]
        : [
            {
              path: '/metadata/labels/alias',
              op: 'remove',
            },
          ];
      try {
        setSubmitError(undefined);
        setIsSubmitting(true);
        await patch<Device>(`devices/${deviceId}`, req);
        onAliasEdited();
        toggleIsEditing();
      } catch (e) {
        setSubmitError(getErrorMessage(e));
      } finally {
        setIsSubmitting(false);
      }
    },
    [deviceId, originalAlias, onAliasEdited, patch],
  );

  const onAliasKeyDown = React.useCallback(
    (
      resetForm: (nextState?: Partial<FormikState<DeviceAliasEditValues>>) => void,
      errors: FormikErrors<DeviceAliasEditValues>,
    ) =>
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          const hasErrors = Object.keys(errors).length > 0;
          if (!hasErrors) {
            void onSubmit({ alias: (e.target as HTMLInputElement).value });
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          toggleIsEditing();
          resetForm();
        }
      },
    [onSubmit],
  );

  return (
    <Grid hasGutter>
      <Formik<DeviceAliasEditValues>
        initialValues={{
          alias: originalAlias,
        }}
        validationSchema={Yup.object({
          alias: validKubernetesLabelValue(t, { isRequired: false, fieldName: t('Alias') }),
        })}
        onSubmit={onSubmit}
      >
        {({ values, errors, resetForm }) => {
          return (
            <GridItem md={6}>
              {isEditing ? (
                <RichValidationTextField
                  fieldName="alias"
                  ref={textInputRef}
                  validations={getLabelValueValidations(t)}
                  placeholder={originalAlias || t('Untitled')}
                  onKeyDown={onAliasKeyDown(resetForm, errors)}
                  onBlur={() => {
                    const isValidAlias = Object.keys(errors).length === 0;
                    if (isValidAlias) {
                      onSubmit(values);
                    }
                    // Avoid submitting or closing the editable mode when the alias is invalid
                  }}
                />
              ) : (
                <>
                  {originalAlias || t('Untitled')}
                  <Button
                    variant="plain"
                    aria-label={t('Edit alias')}
                    onClick={toggleIsEditing}
                    isDisabled={isSubmitting}
                    icon={
                      <Icon size="md">
                        <PencilAltIcon />
                      </Icon>
                    }
                  />
                </>
              )}
            </GridItem>
          );
        }}
      </Formik>
      <GridItem md={8}>
        {submitError && (
          <Alert isInline variant="danger" title={t('Device alias could not be updated')}>
            {getErrorMessage(submitError)}
          </Alert>
        )}
      </GridItem>
    </Grid>
  );
};

export default DeviceAliasEdit;
