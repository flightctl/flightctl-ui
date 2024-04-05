import * as React from 'react';

import {
  Button,
  Divider,
  FormGroup,
  FormSection,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { FieldArray, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import TextField from '@app/components/form/TextField';
import { FleetFormValues, GitConfigTemplate, InlineConfigTemplate, KubeSecretTemplate } from './types';

type GitConfigFormProps = {
  index: number;
};

const GitConfigForm: React.FC<GitConfigFormProps> = ({ index }) => {
  const { values, setFieldValue } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as GitConfigTemplate;
  return (
    <>
      <FormGroup label="Source name" isRequired>
        <TextField
          aria-label="Source name"
          name={`configTemplates[${index}].name`}
          value={template.name}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.name`, value)}
        />
      </FormGroup>
      <FormGroup label="Repository URL" isRequired>
        <TextField
          aria-label="Repository URL"
          name={`configTemplates[${index}].repoURL`}
          value={template.repoURL}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.repoURL`, value)}
        />
      </FormGroup>
      <FormGroup label="Repository target reference" isRequired>
        <TextField
          aria-label="Repository target reference"
          name={`configTemplates[${index}].targetRevision`}
          value={template.targetRevision}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.targetRevision`, value)}
        />
      </FormGroup>
      <FormGroup label="Repository path" isRequired>
        <TextField
          aria-label="Repository path"
          name={`configTemplates[${index}].path`}
          value={template.path}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.path`, value)}
        />
      </FormGroup>
    </>
  );
};

const KubeConfigForm: React.FC<GitConfigFormProps> = ({ index }) => {
  const { values, setFieldValue } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as KubeSecretTemplate;
  return (
    <Grid hasGutter>
      <FormGroup label="Source name" isRequired>
        <TextInput
          aria-label="Source name"
          value={template.name}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.name`, value)}
        />
      </FormGroup>
      <FormGroup label="Secret name" isRequired>
        <TextInput
          aria-label="Secret name"
          value={template.secretName}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.secretName`, value)}
        />
      </FormGroup>
      <FormGroup label="Secret namespace" isRequired>
        <TextInput
          aria-label="Secret namespace"
          value={template.secretNs}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.secretNs`, value)}
        />
      </FormGroup>
      <FormGroup label="Mount path" isRequired>
        <TextInput
          aria-label="Mount path"
          value={template.mountPath}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.mountPath`, value)}
        />
      </FormGroup>
    </Grid>
  );
};

const InlineConfigForm: React.FC<GitConfigFormProps> = ({ index }) => {
  const { values, setFieldValue } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as InlineConfigTemplate;
  return (
    <Grid hasGutter>
      <FormGroup label="Source name" isRequired>
        <TextInput
          aria-label="Source name"
          value={template.name}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.name`, value)}
        />
      </FormGroup>
      <FormGroup label="Inline" isRequired>
        <TextArea
          value={template.inline}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.inline`, value)}
          aria-label="Inline"
        />
      </FormGroup>
    </Grid>
  );
};

const ConfigTemplateForm = () => {
  const { values } = useFormikContext<FleetFormValues>();
  return (
    <FieldArray name="configTemplates">
      {({ push, replace, remove }) => (
        <Grid hasGutter>
          <GridItem span={1} />
          <GridItem span={11}>
            <Grid hasGutter>
              {values.configTemplates.map((ct, index) => (
                <FormSection key={index}>
                  {index !== 0 && (
                    <GridItem>
                      <Divider component="div" />
                    </GridItem>
                  )}
                  <GridItem>
                    <Grid hasGutter>
                      <FormGroup label="Source" isRequired>
                        <FormSelect
                          value={ct.type}
                          onChange={(_, value) => {
                            let template: GitConfigTemplate | KubeSecretTemplate | InlineConfigTemplate;
                            if (value === 'git') {
                              template = {
                                type: 'git',
                                name: ct.name,
                                path: '',
                                repoURL: '',
                                targetRevision: '',
                              } as GitConfigTemplate;
                            } else if (value === 'kube') {
                              template = {
                                type: 'kube',
                                mountPath: '',
                                name: ct.name,
                                secretName: '',
                                secretNs: '',
                              } as KubeSecretTemplate;
                            } else {
                              template = {
                                type: 'inline',
                                inline: '',
                                name: ct.name,
                              } as InlineConfigTemplate;
                            }
                            replace(index, template);
                          }}
                          aria-label="Source select input"
                        >
                          <FormSelectOption value="git" label="Git config provider" />
                          <FormSelectOption value="kube" label="Kubernetes secret provider" />
                          <FormSelectOption value="inline" label="Inline config provider" />
                        </FormSelect>
                      </FormGroup>
                      {ct.type === 'git' && <GitConfigForm index={index} />}
                      {ct.type === 'kube' && <KubeConfigForm index={index} />}
                      {ct.type === 'inline' && <InlineConfigForm index={index} />}
                      {values.configTemplates.length > 1 && (
                        <FormGroup>
                          <Button
                            variant="link"
                            icon={<MinusCircleIcon />}
                            iconPosition="start"
                            onClick={() => remove(index)}
                          >
                            Remove source
                          </Button>
                        </FormGroup>
                      )}
                    </Grid>
                  </GridItem>
                </FormSection>
              ))}
            </Grid>
          </GridItem>
          <FormSection>
            <FormGroup>
              <Button
                variant="link"
                icon={<PlusCircleIcon />}
                iconPosition="start"
                onClick={() => {
                  push({
                    name: '',
                    path: '',
                    repoURL: '',
                    targetRevision: '',
                    type: 'git',
                  } as GitConfigTemplate);
                }}
              >
                Add source
              </Button>
            </FormGroup>
          </FormSection>
        </Grid>
      )}
    </FieldArray>
  );
};

export default ConfigTemplateForm;
