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
} from '@patternfly/react-core';
import { FieldArray, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import TextField from '../../form/TextField';
import { FleetFormValues, GitConfigTemplate, InlineConfigTemplate, KubeSecretTemplate } from './types';
import { useTranslation } from '../../../hooks/useTranslation';

type GitConfigFormProps = {
  index: number;
};

const GitConfigForm: React.FC<GitConfigFormProps> = ({ index }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as GitConfigTemplate;
  return (
    <>
      <FormGroup label={t('Source name')} isRequired>
        <TextField aria-label={t('Source name')} name={`configTemplates[${index}].name`} value={template.name} />
      </FormGroup>
      <FormGroup label={t('Repository URL')} isRequired>
        <TextField
          aria-label={t('Repository URL')}
          name={`configTemplates[${index}].repoURL`}
          value={template.repoURL}
        />
      </FormGroup>
      <FormGroup label={t('Repository target reference')} isRequired>
        <TextField
          aria-label={t('Repository target reference')}
          name={`configTemplates[${index}].targetRevision`}
          value={template.targetRevision}
        />
      </FormGroup>
      <FormGroup label={t('Repository path')} isRequired>
        <TextField aria-label={t('Repository path')} name={`configTemplates[${index}].path`} value={template.path} />
      </FormGroup>
    </>
  );
};

const KubeConfigForm: React.FC<GitConfigFormProps> = ({ index }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as KubeSecretTemplate;
  return (
    <Grid hasGutter>
      <FormGroup label={t('Source name')} isRequired>
        <TextField aria-label={t('Source name')} value={template.name} name={`configTemplates.${index}.name`} />
      </FormGroup>
      <FormGroup label={t('Secret name')} isRequired>
        <TextField
          aria-label={t('Secret name')}
          value={template.secretName}
          name={`configTemplates.${index}.secretName`}
        />
      </FormGroup>
      <FormGroup label={t('Secret namespace')} isRequired>
        <TextField
          aria-label={t('Secret namespace')}
          name={`configTemplates.${index}.secretNs`}
          value={template.secretNs}
        />
      </FormGroup>
      <FormGroup label={t('Mount path')} isRequired>
        <TextField
          aria-label={t('Mount path')}
          name={`configTemplates.${index}.mountPath`}
          value={template.mountPath}
        />
      </FormGroup>
    </Grid>
  );
};

const InlineConfigForm: React.FC<GitConfigFormProps> = ({ index }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as InlineConfigTemplate;
  return (
    <Grid hasGutter>
      <FormGroup label={t('Source name')} isRequired>
        <TextField aria-label={t('Source name')} name={`configTemplates.${index}.name`} value={template.name} />
      </FormGroup>
      <FormGroup label={t('Inline')} isRequired>
        <TextArea
          value={template.inline}
          onChange={(_, value) => setFieldValue(`configTemplates.${index}.inline`, value)}
          aria-label={t('Inline')}
        />
      </FormGroup>
    </Grid>
  );
};

const ConfigTemplateForm = () => {
  const { t } = useTranslation();
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
                      <FormGroup label={t('Source')} isRequired>
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
                          aria-label={t('Source select input')}
                        >
                          <FormSelectOption value="git" label={t('Git config provider')} />
                          <FormSelectOption value="kube" label={t('Kubernetes secret provider')} />
                          <FormSelectOption value="inline" label={t('Inline config provider')} />
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
                            {t('Remove template')}
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
                {t('Add template')}
              </Button>
            </FormGroup>
          </FormSection>
        </Grid>
      )}
    </FieldArray>
  );
};

export default ConfigTemplateForm;
