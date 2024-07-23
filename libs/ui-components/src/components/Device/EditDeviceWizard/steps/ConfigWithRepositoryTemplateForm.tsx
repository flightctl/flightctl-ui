import * as React from 'react';
import { useFormikContext } from 'formik';
import { Button, FormGroup, MenuFooter } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { Trans } from 'react-i18next';

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
            content={t("Suffix to add to the repository's URL to obtain the full HTTP service URL.")}
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
            content={t('Path where to store the file in the device filesystem.')}
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

  const repositoryItems = repositories.reduce((acc, curr) => {
    if (curr.spec.type === repoType) {
      acc[curr.metadata.name || ''] = {
        label: curr.metadata.name,
        description: t('Service URL: {{ serviceURL }}', { serviceURL: curr.spec.url }),
      };
    }
    return acc;
  }, {});

  const selectedRepoName = (values.configTemplates[index] as HttpConfigTemplate | GitConfigTemplate)?.repository;
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
      {repoType === RepoSpecType.GIT && (
        <GitConfigForm template={values.configTemplates[index] as GitConfigTemplate} index={index} />
      )}
      {repoType === RepoSpecType.HTTP && (
        <HttpConfigForm
          template={values.configTemplates[index] as HttpConfigTemplate}
          index={index}
          baseURL={selectedRepo?.spec.url}
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
