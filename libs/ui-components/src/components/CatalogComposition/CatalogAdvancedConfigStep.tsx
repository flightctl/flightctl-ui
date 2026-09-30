import * as React from 'react';
import {
  Alert,
  Content,
  ContentVariants,
  FormGroup,
  List,
  ListItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { type RJSFValidationError } from '@rjsf/utils';
import { useFormikContext } from 'formik';
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import { useTranslation } from '../../hooks/useTranslation';
import DynamicForm from '../DynamicForm/DynamicForm';
import YamlEditorBase from '../common/CodeEditor/YamlEditorBase';
import RadioField from '../form/RadioField';
import type { DynamicFormConfigFormik } from '../Catalog/InstallWizard/types';

import '../Catalog/InstallWizard/steps/AppConfigStep.css';

type CatalogAdvancedConfigStepProps = {
  schemaErrors?: RJSFValidationError[];
};

const CatalogAdvancedConfigStep = ({ schemaErrors }: CatalogAdvancedConfigStepProps) => {
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const { t } = useTranslation();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<DynamicFormConfigFormik>();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h3" size="md">
          {t('Advanced configuration')}
        </Title>
        <Alert
          variant="info"
          isInline
          isPlain
          className="pf-v6-u-mt-sm"
          title={t('Provide any required values and optional overrides for this catalog application.')}
        />
      </StackItem>
      <StackItem>
        <FormGroup label={t('Application configuration')}>
          {values.configSchema && values.configureVia === 'form' ? (
            <Content component={ContentVariants.small} className="pf-v6-u-mb-sm">
              {t('Some fields may not be represented in this form view. Select YAML view for full control.')}
            </Content>
          ) : null}
          <Split hasGutter>
            <SplitItem>{t('Configure via:')}</SplitItem>
            <SplitItem>
              <RadioField
                name="configureVia"
                checkedValue="form"
                id="catalog-composition-configure-form"
                label={t('Form view')}
                isDisabled={!values.configSchema}
              />
            </SplitItem>
            <SplitItem>
              <RadioField
                name="configureVia"
                checkedValue="editor"
                id="catalog-composition-configure-editor"
                label={t('YAML view')}
              />
            </SplitItem>
          </Split>
        </FormGroup>
      </StackItem>
      <StackItem>
        {values.configSchema && values.configureVia === 'form' ? (
          <DynamicForm
            valuesSchema={values.configSchema}
            formData={values.formValues}
            onChange={async (val) => {
              await setFieldValue('formValues', val);
              await setFieldTouched('formValues', true);
            }}
            onValidate={(valid) => {
              void setFieldValue('dynamicFormValid', valid);
            }}
          />
        ) : (
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
        )}
      </StackItem>
      {schemaErrors?.length ? (
        <StackItem>
          <Alert variant="danger" title={t('Configuration is not valid')} isInline>
            <List>
              {schemaErrors.map((error, index) => (
                <ListItem key={index}>
                  {error.property}: {error.message}
                </ListItem>
              ))}
            </List>
          </Alert>
        </StackItem>
      ) : null}
    </Stack>
  );
};

export default CatalogAdvancedConfigStep;
