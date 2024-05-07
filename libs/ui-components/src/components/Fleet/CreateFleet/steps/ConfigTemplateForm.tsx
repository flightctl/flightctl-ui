import * as React from 'react';

import {
  Alert,
  Bullseye,
  Button,
  ExpandableSection,
  FormGroup,
  FormSection,
  Grid,
  MenuFooter,
  Spinner,
  Split,
  SplitItem,
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
import TextAreaField from '../../../form/TextAreaField';
import FormSelect from '../../../form/FormSelect';
import CreateRepositoryModal from '../../../modals/CreateRepositoryModal/CreateRepositoryModal';
import { sortByName } from '../../../../utils/sort/generic';

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

const GitConfigForm: React.FC<ConfigFormProps & Pick<ConfigSectionProps, 'repositories' | 'repoRefetch'>> = ({
  index,
  repositories,
  repoRefetch,
}) => {
  const [createRepoModalOpen, setCreateRepoModalOpen] = React.useState(false);
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<FleetFormValues>();
  const template = values.configTemplates[index] as GitConfigTemplate;

  useValidateOnMount();

  const defaultRepoName = repositories[0]?.metadata.name;

  React.useEffect(() => {
    if (defaultRepoName && template.repository === '') {
      setFieldValue(`configTemplates[${index}].repository`, defaultRepoName);
    }
  }, [template.repository, defaultRepoName, index, setFieldValue]);
  return (
    <>
      <FormGroup label={t('Repository')} isRequired>
        <FormSelect
          name={`configTemplates[${index}].repository`}
          items={repositories.reduce((acc, curr) => {
            acc[curr.metadata.name || ''] = curr.metadata.name;
            return acc;
          }, {})}
        >
          <MenuFooter>
            <Button
              variant="link"
              isInline
              icon={<PlusCircleIcon />}
              onClick={() => {
                setCreateRepoModalOpen(true);
              }}
            >
              {t('Create repository')}
            </Button>
          </MenuFooter>
        </FormSelect>
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
      {createRepoModalOpen && (
        <CreateRepositoryModal
          onClose={() => setCreateRepoModalOpen(false)}
          onSuccess={(repo) => {
            setCreateRepoModalOpen(false);
            repoRefetch();
            setFieldValue(`configTemplates[${index}].repository`, repo.metadata.name, true);
          }}
        />
      )}
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
  repoRefetch: VoidFunction;
};

const ConfigSection = ({ ct, index, repositories, repoRefetch }: ConfigSectionProps) => {
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
            items={{
              git: t('Git config provider'),
              // secret: t('Kubernetes secret provider'), not supported yet
              inline: t('Inline config provider'),
            }}
            name={`configTemplates[${index}].type`}
          />
        </FormGroup>
        {ct.type === 'git' && <GitConfigForm index={index} repositories={repositories} repoRefetch={repoRefetch} />}
        {ct.type === 'secret' && <KubeConfigForm index={index} />}
        {ct.type === 'inline' && <InlineConfigForm index={index} />}
      </Grid>
    </ExpandableSection>
  );
};

const ConfigTemplateForm = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<FleetFormValues>();
  const [repositoryList, isLoading, error, refetch] = useFetchPeriodically<RepositoryList>({
    endpoint: 'repositories',
  });

  const repositories = React.useMemo(() => sortByName(repositoryList?.items || []), [repositoryList]);

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
      {({ push, remove }) => (
        <>
          {values.configTemplates.map((ct, index) => (
            <FormSection key={index}>
              <Split hasGutter>
                <SplitItem isFilled>
                  <ConfigSection ct={ct} index={index} repositories={repositories} repoRefetch={refetch} />
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
