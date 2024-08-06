import * as React from 'react';
import { useFormikContext } from 'formik';
import { Button, FormGroup, Icon, MenuFooter } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { TFunction, Trans } from 'react-i18next';

import { RepoSpecType, Repository } from '@flightctl/types';
import { GitConfigTemplate, HttpConfigTemplate } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import { DeviceSpecConfigFormValues } from '../types';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import CreateRepositoryModal from '../../../modals/CreateRepositoryModal/CreateRepositoryModal';
import WithHelperText from '../../../common/WithHelperText';

type ConfigWithRepositoryTemplateFormProps = {
  repoType: RepoSpecType;
  index: number;
  repositories: Repository[];
  repoRefetch: VoidFunction;
};

const getRepositoryItems = (
  t: TFunction,
  repositories: Repository[],
  repoType: RepoSpecType,
  forcedRepoName?: string,
) => {
  const repositoryItems = repositories.reduce((acc, curr) => {
    if (curr.spec.type === repoType) {
      acc[curr.metadata.name || ''] = {
        label: curr.metadata.name,
        description: curr.spec.url,
      };
    }
    return acc;
  }, {});
  // If there's a broken reference to a repository, we must add an item so the name shows in the dropdown
  if (forcedRepoName && !repositoryItems[forcedRepoName]) {
    repositoryItems[forcedRepoName] = {
      label: forcedRepoName,
      description: (
        <>
          <Icon size="sm" status="danger">
            <ExclamationCircleIcon />
          </Icon>{' '}
          {t('Missing repository')}
        </>
      ),
    };
  }
  return repositoryItems;
};

const GitConfigForm = ({ template, index }: { template: GitConfigTemplate; index: number }) => {
  const { t } = useTranslation();

  return (
    <>
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

const HttpConfigForm = ({
  template,
  baseURL,
  index,
}: {
  template: HttpConfigTemplate;
  index: number;
  baseURL?: string;
}) => {
  const { t } = useTranslation();

  let suffixHelperText: React.ReactNode;
  if (baseURL) {
    const fullURL = `${baseURL}${template.suffix || ''}`;
    suffixHelperText = (
      <Trans t={t}>
        Full HTTP service URL: <strong>{fullURL}</strong>
      </Trans>
    );
  } else {
    suffixHelperText = t('Select a repository to generate the full URL');
  }

  return (
    <>
      <FormGroup
        label={t('Suffix')}
        labelIcon={
          <WithHelperText
            ariaLabel={t('Suffix')}
            content={t(
              "Suffix that will be combined with the repository's base URL to invoke the HTTP service. Can include query parameters.",
            )}
          />
        }
      >
        <TextField
          aria-label={t('Suffix')}
          name={`configTemplates[${index}].suffix`}
          value={template.suffix || ''}
          helperText={suffixHelperText}
        />
      </FormGroup>
      <FormGroup
        label={t('File path')}
        labelIcon={
          <WithHelperText
            ariaLabel={t('File path')}
            content={t('Path of the file where the response will be stored in the device filesystem.')}
          />
        }
        isRequired
      >
        <TextField
          aria-label={t('File path')}
          name={`configTemplates[${index}].filePath`}
          value={template.filePath || ''}
          placeholder={t('/absolute/path')}
        />
      </FormGroup>
    </>
  );
};

const ConfigWithRepositoryTemplateForm = ({
  repoType,
  index,
  repositories,
  repoRefetch,
}: ConfigWithRepositoryTemplateFormProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<DeviceSpecConfigFormValues>();
  const [createRepoModalOpen, setCreateRepoModalOpen] = React.useState(false);

  const ct = values.configTemplates[index] as HttpConfigTemplate | GitConfigTemplate;
  const selectedRepoName = ct?.repository;

  const repositoryItems = getRepositoryItems(t, repositories, repoType, selectedRepoName);
  const selectedRepo = repositories.find((repo) => repo.metadata.name === selectedRepoName);
  return (
    <>
      <FormGroup label={t('Repository')} isRequired>
        <FormSelect
          name={`configTemplates[${index}].repository`}
          items={repositoryItems}
          placeholderText={t('Select a repository')}
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
      {repoType === RepoSpecType.GIT && <GitConfigForm template={ct as GitConfigTemplate} index={index} />}
      {repoType === RepoSpecType.HTTP && (
        <HttpConfigForm template={ct as HttpConfigTemplate} index={index} baseURL={selectedRepo?.spec.url} />
      )}
      {createRepoModalOpen && (
        <CreateRepositoryModal
          onClose={() => setCreateRepoModalOpen(false)}
          onSuccess={(repo) => {
            setCreateRepoModalOpen(false);
            repoRefetch();
            void setFieldValue(`configTemplates[${index}].repository`, repo.metadata.name, true);
          }}
          options={{
            canUseResourceSyncs: false,
            allowedRepoTypes: [repoType],
          }}
        />
      )}
    </>
  );
};

export default ConfigWithRepositoryTemplateForm;
