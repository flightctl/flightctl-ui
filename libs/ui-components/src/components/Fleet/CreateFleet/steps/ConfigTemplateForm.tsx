import * as React from 'react';

import {
  Alert,
  Bullseye,
  Button,
  ExpandableSection,
  FormGroup,
  FormSection,
  FormSelect,
  FormSelectOption,
  Grid,
  Spinner,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { FieldArray, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { Repository, RepositoryList } from '@flightctl/types';

import TextField from '../../../form/TextField';
import { FleetFormValues, GitConfigTemplate, InlineConfigTemplate, KubeSecretTemplate } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import { getErrorMessage } from '../../../../utils/error';
import { Trans } from 'react-i18next';
import { Link, ROUTE } from '../../../../hooks/useNavigate';
import TextAreaField from '../../../form/TextAreaField';

const useValidateOnMount = () => {
  const { validateForm } = useFormikContext<FleetFormValues>();

  // validate new config section on mount
  React.useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

type ConfigFormProps = {
  index: number;
};

const GitConfigForm: React.FC<
  ConfigFormProps & {
    repositories: Repository[];
  }
> = ({ index, repositories }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as GitConfigTemplate;

  useValidateOnMount();

  const defaultRepoName = repositories[0]?.metadata.name || '';

  React.useEffect(() => {
    if (template.repository === '') {
      setFieldValue(`configTemplates[${index}].repository`, defaultRepoName);
    }
  }, [template.repository, defaultRepoName, index, setFieldValue]);
  return (
    <>
      <FormGroup label={t('Repository')} isRequired>
        <Stack hasGutter>
          <StackItem>
            <FormSelect
              value={template.repository}
              onChange={(_, value) => setFieldValue(`configTemplates[${index}].repository`, value)}
              aria-label={t('Repository select input')}
              isDisabled={!repositories.length}
            >
              {repositories.map((repo) => (
                <FormSelectOption
                  key={repo.metadata.name}
                  value={repo.metadata.name}
                  label={repo.metadata.name || ''}
                />
              ))}
            </FormSelect>
          </StackItem>
          {!repositories.length && (
            <StackItem>
              <Alert isInline variant="warning" title={t('No repository exists.')}>
                <Trans t={t}>
                  No repository has been created yet. <Link to={ROUTE.REPO_CREATE}>Create a new repository</Link>{' '}
                </Trans>
              </Alert>
            </StackItem>
          )}
        </Stack>
      </FormGroup>
      <FormGroup label={t('Branch/tag/commit')} isRequired>
        <TextField
          aria-label={t('Branch/tag/commit')}
          name={`configTemplates[${index}].targetRevision`}
          value={template.targetRevision}
        />
      </FormGroup>
      <FormGroup label={t('Path')} isRequired>
        <TextField
          aria-label={t('Path')}
          name={`configTemplates[${index}].path`}
          value={template.path}
          placeholder={t('/absolute/path')}
        />
      </FormGroup>
    </>
  );
};

const KubeConfigForm: React.FC<ConfigFormProps> = ({ index }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as KubeSecretTemplate;
  useValidateOnMount();
  return (
    <>
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
          placeholder={t('/absolute/path')}
        />
      </FormGroup>
    </>
  );
};

const InlineConfigForm: React.FC<ConfigFormProps> = ({ index }) => {
  const { t } = useTranslation();
  useValidateOnMount();
  return (
    <FormGroup label={t('Inline')} isRequired>
      <TextAreaField name={`configTemplates.${index}.inline`} />
    </FormGroup>
  );
};

type ConfigSectionProps = {
  ct: KubeSecretTemplate | InlineConfigTemplate | GitConfigTemplate;
  index: number;
  repositories: Repository[];
  replace: (index: number, value: KubeSecretTemplate | InlineConfigTemplate | GitConfigTemplate) => void;
};

const ConfigSection = ({ ct, index, replace, repositories }: ConfigSectionProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { values } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as GitConfigTemplate;

  return (
    <ExpandableSection
      toggleContent={
        <Split hasGutter>
          <SplitItem>{t('Configurations/applications')}</SplitItem>
          {!isExpanded && !!template.name && <SplitItem style={{ color: 'black' }}>{template.name}</SplitItem>}
        </Split>
      }
      isIndented
      isExpanded={isExpanded}
      onToggle={(_, expanded) => setIsExpanded(expanded)}
    >
      <Grid hasGutter>
        <FormGroup label={t('Source name')} isRequired>
          <TextField aria-label={t('Source name')} name={`configTemplates[${index}].name`} value={ct.name} />
        </FormGroup>
        <FormGroup label={t('Source type')} isRequired>
          <FormSelect
            value={ct.type}
            onChange={(_, value) => {
              let template: GitConfigTemplate | KubeSecretTemplate | InlineConfigTemplate;
              if (value === 'git') {
                template = {
                  type: 'git',
                  name: ct.name,
                  path: '',
                  repository: '',
                  targetRevision: '',
                } as GitConfigTemplate;
              } else if (value === 'secret') {
                template = {
                  type: 'secret',
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
            {
              // not supported yet
              //<FormSelectOption value="secret" label={t('Kubernetes secret provider')} />
            }
            <FormSelectOption value="inline" label={t('Inline config provider')} />
          </FormSelect>
        </FormGroup>
        {ct.type === 'git' && <GitConfigForm index={index} repositories={repositories} />}
        {ct.type === 'secret' && <KubeConfigForm index={index} />}
        {ct.type === 'inline' && <InlineConfigForm index={index} />}
      </Grid>
    </ExpandableSection>
  );
};

const ConfigTemplateForm = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<FleetFormValues>();
  const [repositoryList, isLoading, error] = useFetchPeriodically<RepositoryList>({ endpoint: 'repositories' });

  if (error) {
    return (
      <Alert isInline variant="danger" title={t('Failed to load repositories')}>
        {getErrorMessage(error)}
      </Alert>
    );
  } else if (isLoading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <FieldArray name="configTemplates">
      {({ push, replace, remove }) => (
        <>
          {values.configTemplates.map((ct, index) => (
            <FormSection key={index}>
              <Split hasGutter>
                <SplitItem isFilled>
                  <ConfigSection replace={replace} ct={ct} index={index} repositories={repositoryList?.items || []} />
                </SplitItem>
                <SplitItem>
                  <Button
                    variant="link"
                    icon={<MinusCircleIcon />}
                    iconPosition="start"
                    onClick={() => remove(index)}
                  />
                </SplitItem>
              </Split>
            </FormSection>
          ))}
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
                    repository: '',
                    targetRevision: '',
                    type: 'git',
                  } as GitConfigTemplate);
                }}
              >
                {t('Add configurations/applications')}
              </Button>
            </FormGroup>
          </FormSection>
        </>
      )}
    </FieldArray>
  );
};

export default ConfigTemplateForm;
