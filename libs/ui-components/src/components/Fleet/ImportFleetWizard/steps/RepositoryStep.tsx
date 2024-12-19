import * as React from 'react';
import { FormGroup, FormSection, Grid, Radio } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Repository } from '@flightctl/types';
import { ImportFleetFormValues } from '../types';

import { RepositoryForm } from '../../../Repository/CreateRepository/CreateRepositoryForm';
import RepositoryStatus from '../../../Status/RepositoryStatus';
import { getLastTransitionTimeText, getRepositorySyncStatus } from '../../../../utils/status/repository';
import { useTranslation } from '../../../../hooks/useTranslation';
import FormSelect from '../../../form/FormSelect';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { useAccessReview } from '../../../../hooks/useAccessReview';
import { RESOURCE, VERB } from '../../../../types/rbac';

export const repositoryStepId = 'repository';

export const isRepoStepValid = (values: ImportFleetFormValues, errors: FormikErrors<ImportFleetFormValues>) => {
  if (values.useExistingRepo) {
    return !errors.existingRepo;
  }
  return (
    !errors.name &&
    !errors.url &&
    !errors.configType &&
    !errors.httpConfig &&
    !errors.sshConfig &&
    !errors.useAdvancedConfig
  );
};

const ExistingRepoForm = ({ repositories }: { repositories: Repository[] }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ImportFleetFormValues>();

  const currentRepo = repositories.find((r) => r.metadata.name === values.existingRepo);

  return (
    <>
      <FormGroup label={t('Repository')} fieldId="repository">
        <FormSelect
          name="existingRepo"
          items={repositories.reduce((acc, curr) => {
            acc[curr.metadata.name || ''] = curr.metadata.name || '';
            return acc;
          }, {})}
          placeholderText={t('Select a repository')}
        />
      </FormGroup>
      {currentRepo && (
        <Table>
          <Thead>
            <Tr>
              <Th>{t('URL')}</Th>
              <Th>{t('Sync status')}</Th>
              <Th>{t('Last transition')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td dataLabel={t('URL')}>{currentRepo.spec.url}</Td>
              <Td dataLabel={t('Sync status')}>
                <RepositoryStatus statusInfo={getRepositorySyncStatus(currentRepo)} />
              </Td>
              <Td dataLabel={t('Last transition')}>{getLastTransitionTimeText(currentRepo, t).text}</Td>
            </Tr>
          </Tbody>
        </Table>
      )}
    </>
  );
};

const RepositoryStep = ({ repositories, hasLoaded }: { repositories: Repository[]; hasLoaded: boolean }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<ImportFleetFormValues>();

  const [canCreateRepo] = useAccessReview(RESOURCE.REPOSITORY, VERB.CREATE);

  const noRepositoriesExist = hasLoaded && repositories.length === 0;
  React.useEffect(() => {
    if (values.useExistingRepo && noRepositoriesExist) {
      void setFieldValue('useExistingRepo', false);
    }
  }, [setFieldValue, values.useExistingRepo, noRepositoriesExist]);

  return (
    <FlightCtlForm>
      <Grid span={8}>
        {canCreateRepo && (
          <FormSection>
            <FormGroup isInline>
              <Radio
                isChecked={values.useExistingRepo}
                onChange={() => setFieldValue('useExistingRepo', true, true)}
                id="existing-repo"
                name="repo"
                label={t('Use an existing Git repository')}
                isDisabled={noRepositoriesExist}
              />
              <Radio
                isChecked={!values.useExistingRepo}
                onChange={() => setFieldValue('useExistingRepo', false, true)}
                id="new-repo"
                name="repo"
                label={t('Use a new Git repository')}
              />
            </FormGroup>
          </FormSection>
        )}
        <FormSection>
          {values.useExistingRepo ? <ExistingRepoForm repositories={repositories} /> : <RepositoryForm />}
        </FormSection>
      </Grid>
    </FlightCtlForm>
  );
};

export default RepositoryStep;
