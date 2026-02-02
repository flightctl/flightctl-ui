import {
  Alert,
  FormGroup,
  Grid,
  GridItem,
  List,
  ListItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { RJSFValidationError } from '@rjsf/utils';
import { FormikErrors, useFormikContext } from 'formik';
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import * as React from 'react';

import { useTranslation } from '../../../../hooks/useTranslation';
import DynamicForm, { AssetSelection } from '../../../DynamicForm/DynamicForm';
import YamlEditorBase from '../../../common/CodeEditor/YamlEditorBase';
import TextField from '../../../form/TextField';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import RadioField from '../../../form/RadioField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { DynamicFormConfigFormik, InstallAppFormik } from '../types';

import './AppConfigStep.css';

type DynamicAppFormProps = {
  schemaErrors?: RJSFValidationError[];
  isInModal?: boolean;
  isEdit: boolean;
};

export const DynamicAppForm = ({ schemaErrors, isInModal, isEdit }: DynamicAppFormProps) => {
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const { t } = useTranslation();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<InstallAppFormik>();

  const formContext = React.useMemo(() => {
    const onAssetSelected = (selection: AssetSelection) => {
      const existing = values.selectedAssets.findIndex((a) => a.volumeIndex === selection.volumeIndex);
      let newAssets: AssetSelection[];
      if (existing >= 0) {
        const updated = [...values.selectedAssets];
        updated[existing] = selection;
        newAssets = updated;
      } else {
        newAssets = [...values.selectedAssets, selection];
      }
      setFieldValue('selectedAssets', newAssets);
    };

    const onBeforeArrayItemRemoved = (arrayId: string, removedIndex: number) => {
      if (arrayId === 'root_volumes') {
        const newAssets = values.selectedAssets
          .filter((a) => a.volumeIndex !== removedIndex)
          .map((a) => (a.volumeIndex > removedIndex ? { ...a, volumeIndex: a.volumeIndex - 1 } : a));
        setFieldValue('selectedAssets', newAssets);
      }
    };

    const onAssetCleared = (volumeIndex: number) => {
      const newAssets = values.selectedAssets.filter((a) => a.volumeIndex !== volumeIndex);
      setFieldValue('selectedAssets', newAssets);
    };

    return { onAssetSelected, onBeforeArrayItemRemoved, onAssetCleared, selectedAssets: values.selectedAssets };
  }, [values.selectedAssets, setFieldValue]);

  return (
    <Stack hasGutter>
      <StackItem>
        <FormGroupWithHelperText
          label={t('Application name')}
          content={t('Application name must be unique.')}
          isRequired
        >
          <TextField aria-label={t('Application name')} name="appName" isDisabled={isEdit} />
        </FormGroupWithHelperText>
      </StackItem>
      <StackItem>
        <FormGroup label={t('Application configuration')} />
        <Split hasGutter>
          <SplitItem>{t('Configure via:')}</SplitItem>
          <SplitItem>
            <RadioField
              name="configureVia"
              checkedValue="form"
              id="form"
              label={t('Form view')}
              isDisabled={!values.configSchema}
            />
          </SplitItem>
          <SplitItem>
            <RadioField name="configureVia" checkedValue="editor" id="editor" label={t('YAML view')} />
          </SplitItem>
        </Split>
      </StackItem>
      {!values.configSchema && (
        <StackItem>
          <Alert
            variant="info"
            isInline
            title={t('Form view is disabled for this application because the schema is not available')}
          />
        </StackItem>
      )}
      <StackItem>
        {values.configSchema && values.configureVia === 'form' ? (
          <Stack hasGutter>
            <StackItem>
              <Alert
                variant="info"
                isInline
                title={t(
                  'Note: Some fields may not be represented in this form view. Please select "YAML view" for full control.',
                )}
              />
            </StackItem>
            <StackItem>
              <Grid>
                <GridItem span={isInModal ? 12 : 6}>
                  <DynamicForm
                    valuesSchema={values.configSchema}
                    formData={values.formValues}
                    onChange={async (val) => {
                      await setFieldValue('formValues', val);
                      await setFieldTouched('formValues', true);
                    }}
                    onValidate={(valid) => {
                      setFieldValue('dynamicFormValid', valid);
                    }}
                    formContext={formContext}
                  />
                </GridItem>
              </Grid>
            </StackItem>
          </Stack>
        ) : (
          <Stack hasGutter>
            <StackItem>
              <div className="fctl-yaml-editor">
                <YamlEditorBase
                  showActions={false}
                  isSaving={false}
                  onCancel={() => {}}
                  code={values.editorContent}
                  editorRef={editorRef}
                  onChange={async (val) => {
                    await setFieldValue('editorContent', val);
                    await setFieldTouched('editorContent', true);
                  }}
                />
              </div>
            </StackItem>
          </Stack>
        )}
      </StackItem>
      {schemaErrors?.length ? (
        <StackItem>
          <Alert variant="danger" title={t('Configuration is not valid')} isInline>
            <List>
              {schemaErrors.map((e, index) => (
                <ListItem key={index}>
                  {e.property}: {e.message}
                </ListItem>
              ))}
            </List>
          </Alert>
        </StackItem>
      ) : null}
    </Stack>
  );
};

export const isAppConfigStepValid = (values: DynamicFormConfigFormik, errors: FormikErrors<DynamicFormConfigFormik>) =>
  !errors.appName && (values.configureVia === 'form' ? values.dynamicFormValid : !errors.editorContent);

type AppConfigStepProps = {
  schemaErrors?: RJSFValidationError[];
};

const AppConfigStep = ({ schemaErrors }: AppConfigStepProps) => {
  const { t } = useTranslation();

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h3">{t('Application configuration')}</Title>
        </StackItem>
        <StackItem>
          <DynamicAppForm schemaErrors={schemaErrors} isEdit={false} />
        </StackItem>
      </Stack>
    </FlightCtlForm>
  );
};

export default AppConfigStep;
