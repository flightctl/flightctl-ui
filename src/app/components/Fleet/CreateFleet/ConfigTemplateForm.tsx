import {
  Button,
  Divider,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { FieldArray, useFormikContext } from 'formik';
import * as React from 'react';
import { FleetFormValues, GitConfigTemplate, InlineConfigTemplate, KubeSecretTemplate } from './types';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

type GitConfigFormProps = {
  index: number;
};

const GitConfigForm: React.FC<GitConfigFormProps> = ({ index }) => {
  const { values, setFieldValue } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as GitConfigTemplate;
  return (
    <>
      <FormGroup label="Source name" isRequired>
        <TextInput
          aria-label="Source name"
          value={template.name}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.name`, value)}
        />
      </FormGroup>
      <FormGroup label="Repository URL" isRequired>
        <TextInput
          aria-label="Repository URL"
          value={template.repoURL}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.repoURL`, value)}
        />
      </FormGroup>
      <FormGroup label="Repository target reference" isRequired>
        <TextInput
          aria-label="Repository target reference"
          value={template.targetRevision}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.targetRevision`, value)}
        />
      </FormGroup>
      <FormGroup label="Repository path" isRequired>
        <TextInput
          aria-label="Repository path"
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
          value={values.name}
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
                <React.Fragment key={index}>
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
                            } else if (value === 'kubeSecret') {
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
                          <FormSelectOption value="kubeSecret" label="Kubernetes secret provider" />
                          <FormSelectOption value="inline" label="Inline config provider" />
                        </FormSelect>
                      </FormGroup>
                      {ct.type === 'git' && <GitConfigForm index={index} />}
                      {ct.type === 'kube' && <KubeConfigForm index={index} />}
                      {ct.type === 'inline' && <InlineConfigForm index={index} />}
                      {index !== 0 && (
                        <Button
                          variant="link"
                          icon={<MinusCircleIcon />}
                          iconPosition="start"
                          onClick={() => remove(index)}
                        >
                          Remove source
                        </Button>
                      )}
                    </Grid>
                  </GridItem>
                </React.Fragment>
              ))}
            </Grid>
          </GridItem>
          <GridItem>
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
          </GridItem>
        </Grid>
      )}
    </FieldArray>
  );
};

export default ConfigTemplateForm;
