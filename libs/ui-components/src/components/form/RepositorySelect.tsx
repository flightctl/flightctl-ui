import * as React from 'react';
import { useField, useFormikContext } from 'formik';
import {
  Content,
  ContentVariants,
  FormGroup,
  Grid,
  GridItem,
  Icon,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { TFunction } from 'react-i18next';

import { ConditionStatus, ConditionType, RepoSpecType, Repository } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { StatusLevel } from '../../utils/status/common';
import CreateRepositoryModal from '../modals/CreateRepositoryModal/CreateRepositoryModal';
import { StatusDisplayContent } from '../Status/StatusDisplay';
import { getRepoUrlOrRegistry } from '../Repository/CreateRepository/utils';
import FormSelect, { SelectItem } from './FormSelect';
import { DefaultHelperText } from './FieldHelperText';

export const getRepositoryItems = (
  t: TFunction,
  repositories: Repository[],
  repoType: RepoSpecType,
  selectedRepoName?: string,
) => {
  const invalidRepoItems: Record<string, SelectItem> = {};
  const validRepoItems: Record<string, SelectItem> = {};

  repositories
    .filter((repo) => {
      return repo.spec.type === repoType;
    })
    .forEach((repo) => {
      const repoName = repo.metadata.name as string;
      const accessibleCondition = repo.status?.conditions?.find((c) => c.type === ConditionType.RepositoryAccessible);
      const isAccessible = accessibleCondition && accessibleCondition.status === ConditionStatus.ConditionStatusTrue;
      const isInaccessible = accessibleCondition && accessibleCondition.status === ConditionStatus.ConditionStatusFalse;
      const urlOrRegistry = getRepoUrlOrRegistry(repo.spec);

      let accessText = t('Unknown');
      let level: StatusLevel = 'unknown';
      if (isAccessible) {
        accessText = t('Available');
        level = 'success';
      } else if (isInaccessible) {
        accessText = t('Not available');
        level = 'danger';
      }

      validRepoItems[repoName] = {
        label: (
          <Grid hasGutter style={{ alignItems: 'center' }}>
            <GridItem span={8}>
              <Stack>
                <StackItem>{repoName}</StackItem>
                <StackItem>
                  <Content component={ContentVariants.small}>{urlOrRegistry}</Content>
                </StackItem>
              </Stack>
            </GridItem>
            <GridItem span={4}>
              <StatusDisplayContent label={accessText} level={level} />
            </GridItem>
          </Grid>
        ),
        selectedLabel: repoName,
      };
    });

  // If the selected repository has been removed, we still consider it "valid" since it needs to be selected initially
  const isSelectedRepoMissing =
    selectedRepoName && !repositories.some((repo) => repo.metadata.name === selectedRepoName);
  if (isSelectedRepoMissing && !validRepoItems[selectedRepoName]) {
    validRepoItems[selectedRepoName] = {
      label: (
        <Stack>
          <StackItem>{selectedRepoName}</StackItem>
          <StackItem>
            <Icon size="sm" status="danger">
              <ExclamationCircleIcon />
            </Icon>{' '}
            {t('Missing repository')}
          </StackItem>
        </Stack>
      ),
      selectedLabel: selectedRepoName,
    };
  }

  return { validRepoItems, invalidRepoItems };
};

type RepositorySelectProps = {
  name: string;
  label?: string;
  helperText?: string;
  repositories: Repository[];
  repoType: RepoSpecType;
  canCreateRepo: boolean;
  isReadOnly?: boolean;
  repoRefetch?: VoidFunction;
  options?: {
    writeAccessOnly?: boolean;
    enforcedRepoTypeMessage?: string;
  };
  isRequired?: boolean;
};

const ReadOnlyRepositoryListItem = ({ invalidRepoItems }: { invalidRepoItems: Record<string, SelectItem> }) => {
  const itemKeys = Object.keys(invalidRepoItems);
  if (itemKeys.length === 0) {
    return null;
  }
  return (
    <SelectList className="fctl-form-select__menu">
      {itemKeys.map((key) => {
        const item = invalidRepoItems[key];
        return (
          <SelectOption key={key} value={key} isDisabled>
            {item.label}
          </SelectOption>
        );
      })}
    </SelectList>
  );
};

const RepositorySelect = ({
  name,
  repositories,
  repoType,
  canCreateRepo,
  isReadOnly,
  repoRefetch,
  label,
  helperText,
  options,
  isRequired,
}: RepositorySelectProps) => {
  const { t } = useTranslation();
  const { setFieldValue } = useFormikContext();
  const [field] = useField<string>(name);
  const [createRepoModalOpen, setCreateRepoModalOpen] = React.useState(false);

  const { validRepoItems, invalidRepoItems } = React.useMemo(() => {
    return getRepositoryItems(t, repositories, repoType, field.value);
  }, [t, repositories, repoType, field.value]);

  const handleCreateRepository = (repo: Repository) => {
    setCreateRepoModalOpen(false);
    if (repoRefetch) {
      repoRefetch();
    }

    void setFieldValue(name, repo.metadata.name, true);
  };

  const addAction = canCreateRepo
    ? { label: t('Create repository'), onAdd: () => setCreateRepoModalOpen(true) }
    : undefined;

  return (
    <>
      <FormGroup label={label || t('Repository')} isRequired={isRequired}>
        <FormSelect
          name={name}
          items={validRepoItems}
          withStatusIcon
          placeholderText={t('Select a repository')}
          isDisabled={isReadOnly}
          addAction={addAction}
        >
          <ReadOnlyRepositoryListItem invalidRepoItems={invalidRepoItems} />
        </FormSelect>

        {helperText && <DefaultHelperText helperText={helperText} />}
      </FormGroup>
      {createRepoModalOpen && (
        <CreateRepositoryModal
          type={repoType}
          onClose={() => setCreateRepoModalOpen(false)}
          onSuccess={handleCreateRepository}
          options={options}
        />
      )}
    </>
  );
};

export default RepositorySelect;
