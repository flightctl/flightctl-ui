import * as React from 'react';
import { useFormikContext } from 'formik';
import { FormGroup } from '@patternfly/react-core';
import { Trans } from 'react-i18next';

import { GitRepoSpec, HttpRepoSpec, RepoSpecType, Repository } from '@flightctl/types';
import { DeviceSpecConfigFormValues, GitConfigTemplate, HttpConfigTemplate } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import RepositorySelect from '../../../form/RepositorySelect';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';

type ConfigWithRepositoryTemplateFormProps = {
  repoType: RepoSpecType;
  index: number;
  repositories: Repository[];
  repoRefetch: VoidFunction;
  isReadOnly?: boolean;
  canCreateRepo: boolean;
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
  const { values } = useFormikContext<DeviceSpecConfigFormValues>();

  const ct = values.configTemplates[index] as HttpConfigTemplate | GitConfigTemplate;
  const selectedRepo = repositories.find((repo) => repo.metadata.name === ct.repository);
  const repoSpec = selectedRepo?.spec as GitRepoSpec | HttpRepoSpec | undefined;

  return (
    <>
      <RepositorySelect
        name={`configTemplates[${index}].repository`}
        repositories={repositories}
        repoType={repoType}
        canCreateRepo={canCreateRepo}
        isReadOnly={isReadOnly}
        repoRefetch={repoRefetch}
        isRequired
      />
      {repoType === RepoSpecType.RepoSpecTypeGit && (
        <GitConfigForm template={ct as GitConfigTemplate} index={index} isReadOnly={isReadOnly} />
      )}
      {repoType === RepoSpecType.RepoSpecTypeHttp && (
        <HttpConfigForm
          template={ct as HttpConfigTemplate}
          index={index}
          baseURL={repoSpec?.url || ''}
          isReadOnly={isReadOnly}
        />
      )}
    </>
  );
};

export default ConfigWithRepositoryTemplateForm;
