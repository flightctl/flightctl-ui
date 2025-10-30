import * as React from 'react';
import { useFormikContext } from 'formik';
import { Button, FormGroup, Icon, MenuFooter } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { TFunction, Trans } from 'react-i18next';

import { RepoSpecType, Repository } from '@flightctl/types';
import { DeviceSpecConfigFormValues, GitConfigTemplate, HttpConfigTemplate } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import FormSelect from '../../../form/FormSelect';
import CreateRepositoryModal from '../../../modals/CreateRepositoryModal/CreateRepositoryModal';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';

type ConfigWithRepositoryTemplateFormProps = {
  repoType: RepoSpecType;
  index: number;
  repositories: Repository[];
  repoRefetch: VoidFunction;
  isReadOnly?: boolean;
  canCreateRepo: boolean;
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

const GitConfigForm = ({
  template,
  index,
  isReadOnly,
}: {
  template: GitConfigTemplate;
  index: number;
  isReadOnly?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <FormGroup label={t('Branch/tag/commit')} isRequired>
        <TextField
          aria-label={t('Branch/tag/commit')}
          name={`configTemplates[${index}].targetRevision`}
          value={template.targetRevision}
          isDisabled={isReadOnly}
        />
      </FormGroup>
      <FormGroupWithHelperText
        label={t('Path')}
        content={t('Path in the repository where the configuration files are located.')}
        isRequired
      >
        <TextField
          aria-label={t('Path')}
          name={`configTemplates[${index}].path`}
          value={template.path}
          placeholder={t('/absolute/path')}
          isDisabled={isReadOnly}
        />
      </FormGroupWithHelperText>
    </>
  );
};

const HttpConfigForm = ({
  template,
  baseURL,
  index,
  isReadOnly,
}: {
  template: HttpConfigTemplate;
  index: number;
  baseURL?: string;
  isReadOnly?: boolean;
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
      <FormGroupWithHelperText
        label={t('Suffix')}
        content={t(
          "Suffix that will be combined with the repository's base URL to invoke the HTTP service. Can include query parameters.",
        )}
      >
        <TextField
          aria-label={t('Suffix')}
          name={`configTemplates[${index}].suffix`}
          value={template.suffix || ''}
          helperText={suffixHelperText}
          isDisabled={isReadOnly}
        />
      </FormGroupWithHelperText>
      <FormGroupWithHelperText
        label={t('File path')}
        content={t('Path of the file where the response will be stored in the device filesystem.')}
        isRequired
      >
        <TextField
          aria-label={t('File path')}
          name={`configTemplates[${index}].filePath`}
          value={template.filePath || ''}
          placeholder={t('/absolute/path')}
          isDisabled={isReadOnly}
        />
      </FormGroupWithHelperText>
    </>
  );
};

const ConfigWithRepositoryTemplateForm = ({
  repoType,
  index,
  repositories,
  repoRefetch,
  isReadOnly,
  canCreateRepo,
}: ConfigWithRepositoryTemplateFormProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<DeviceSpecConfigFormValues>();
  const [createRepoModalOpen, setCreateRepoModalOpen] = React.useState(false);

  const ct = values.configTemplates[index] as HttpConfigTemplate | GitConfigTemplate;
  const selectedRepoName = ct.repository;

  const repositoryItems = isReadOnly
    ? {
        [selectedRepoName]: {
          label: selectedRepoName,
          description: '',
        },
      }
    : getRepositoryItems(t, repositories, repoType, selectedRepoName);

  const selectedRepo = repositories.find((repo) => repo.metadata.name === selectedRepoName);
  return (
    <>
      <FormGroup label={t('Repository')} isRequired>
        <FormSelect
          name={`configTemplates[${index}].repository`}
          items={repositoryItems}
          withStatusIcon
          placeholderText={t('Select a repository')}
          isDisabled={isReadOnly}
        >
          {canCreateRepo && (
            <MenuFooter>
              <Button
                variant="link"
                isInline
                icon={<PlusCircleIcon />}
                onClick={() => {
                  setCreateRepoModalOpen(true);
                }}
                isDisabled={isReadOnly}
              >
                {t('Create repository')}
              </Button>
            </MenuFooter>
          )}
        </FormSelect>
      </FormGroup>
      {repoType === RepoSpecType.Git && (
        <GitConfigForm template={ct as GitConfigTemplate} index={index} isReadOnly={isReadOnly} />
      )}
      {repoType === RepoSpecType.Http && (
        <HttpConfigForm
          template={ct as HttpConfigTemplate}
          index={index}
          baseURL={selectedRepo?.spec.url}
          isReadOnly={isReadOnly}
        />
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
