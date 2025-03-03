import * as React from 'react';
import { Alert, Button, Grid, GridItem, Icon } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';
import { Formik, useField } from 'formik';
import * as Yup from 'yup';

import { Device, PatchRequest } from '@flightctl/types';
import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { getErrorMessage } from '../../../utils/error';
import RichValidationTextField from '../../form/RichValidationTextField';
import { getLabelValueValidations, validKubernetesLabelValue } from '../../form/validations';

type DeviceAliasEditProps = { deviceId: string; alias?: string; onAliasEdited: VoidFunction };
type DeviceAliasEditValues = { alias: string };

const DeviceAliasInputField = ({
  alias,
  textInputRef,
  toggleIsEditing,
  onSubmit,
}: {
  alias?: string;
  textInputRef: React.RefObject<HTMLInputElement>;
  toggleIsEditing: VoidFunction;
  onSubmit: ({ alias }: DeviceAliasEditValues) => void;
}) => {
  const { t } = useTranslation();

  const [{ value }, , { setTouched, setValue }] = useField<string>('alias');

  const onAliasKeyDown = React.useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const newErrors = await setTouched(true, true);
        if (Object.keys(newErrors || {}).length === 0) {
          void onSubmit({ alias: (e.target as HTMLInputElement).value });
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setValue(alias || t('Untitled'));
        toggleIsEditing();
      }
    },
    [t, onSubmit, alias, setValue, setTouched, toggleIsEditing],
  );

  return (
    <RichValidationTextField
      fieldName="alias"
      ref={textInputRef}
      validations={getLabelValueValidations(t)}
      placeholder={alias || t('Untitled')}
      onKeyDown={onAliasKeyDown}
      onBlur={async () => {
        const newErrors = await setTouched(true, true);
        if (Object.keys(newErrors || {}).length === 0) {
          void onSubmit({ alias: value });
        }
      }}
    />
  );
};

const DeviceAliasEdit = ({ deviceId, alias: originalAlias = '', onAliasEdited }: DeviceAliasEditProps) => {
  const { t } = useTranslation();
  const { patch } = useFetch();

  const textInputRef = React.useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = React.useState<boolean>();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>();
  const [submitError, setSubmitError] = React.useState<string>();

  const toggleIsEditing = React.useCallback(() => {
    setIsEditing((wasEditing) => !wasEditing);
  }, []);

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
    [deviceId, originalAlias, onAliasEdited, patch, toggleIsEditing],
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
        validateOnBlur
        onSubmit={onSubmit}
      >
        <GridItem md={6}>
          {isEditing ? (
            <DeviceAliasInputField
              alias={originalAlias}
              textInputRef={textInputRef}
              onSubmit={onSubmit}
              toggleIsEditing={toggleIsEditing}
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
