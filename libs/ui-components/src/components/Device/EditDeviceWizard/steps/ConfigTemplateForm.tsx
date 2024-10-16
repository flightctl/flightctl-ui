import * as React from 'react';

import {
  Alert,
  Bullseye,
  Button,
  FormGroup,
  FormSection,
  Grid,
  Spinner,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { FieldArray, useField, useFormikContext } from 'formik';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';

import { RepoSpecType, Repository, RepositoryList } from '@flightctl/types';
import { SpecConfigTemplate } from '../../../../types/deviceSpec';
import { DeviceSpecConfigFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import { getErrorMessage } from '../../../../utils/error';
import { sortByName } from '../../../../utils/sort/generic';
import { getDnsSubdomainValidations } from '../../../form/validations';
import ErrorHelperText from '../../../form/FieldHelperText';
import FormSelect from '../../../form/FormSelect';
import RichValidationTextField from '../../../form/RichValidationTextField';
import ConfigWithRepositoryTemplateForm from './ConfigWithRepositoryTemplateForm';
import ConfigK8sSecretTemplateForm from './ConfigK8sSecretTemplateForm';
import ConfigInlineTemplateForm from './ConfigInlineTemplateForm';
import ExpandableFormSection from '../../../form/ExpandableFormSection';

const useValidateOnMount = () => {
  const { validateForm } = useFormikContext<DeviceSpecConfigFormValues>();

  // validate new config section on mount
  React.useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

type ConfigSectionProps = {
  index: number;
  repositories: Repository[];
  repoRefetch: VoidFunction;
};

const ConfigSection = ({ index, repositories, repoRefetch }: ConfigSectionProps) => {
  const { t } = useTranslation();
  const fieldName = `configTemplates[${index}]`;
  const [
    {
      value: { name, type },
    },
  ] = useField<SpecConfigTemplate>(fieldName);

  useValidateOnMount();

  return (
    <ExpandableFormSection title={t('Configurations')} fieldName={fieldName} description={name}>
      <Grid hasGutter>
        <RichValidationTextField
          fieldName={`${fieldName}.name`}
          aria-label={t('Source name')}
          validations={getDnsSubdomainValidations(t)}
          isRequired
        />

        <FormGroup label={t('Source type')} isRequired>
          <FormSelect
            items={{
              git: t('Git configuration'),
              http: t('Http configuration'),
              // secret: t('Kubernetes secret provider'), not supported yet
              inline: t('Inline configuration'),
            }}
            name={`${fieldName}.type`}
            placeholderText={t('Select a source type')}
          />
        </FormGroup>
        {type === 'secret' && <ConfigK8sSecretTemplateForm index={index} />}
        {type === 'inline' && <ConfigInlineTemplateForm index={index} />}
        {(type === 'http' || type === 'git') && (
          <ConfigWithRepositoryTemplateForm
            repoType={type as RepoSpecType}
            index={index}
            repositories={repositories}
            repoRefetch={repoRefetch}
          />
        )}
      </Grid>
    </ExpandableFormSection>
  );
};

const ConfigTemplateForm = () => {
  const { t } = useTranslation();
  const { values, errors } = useFormikContext<DeviceSpecConfigFormValues>();
  const [repositoryList, isLoading, error, refetch] = useFetchPeriodically<RepositoryList>({
    endpoint: 'repositories',
  });

  const repositories = React.useMemo(() => sortByName(repositoryList?.items || []), [repositoryList]);
  const generalError = typeof errors.configTemplates === 'string' ? errors.configTemplates : undefined;

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
                  <ConfigSection index={index} repositories={repositories} repoRefetch={refetch} />
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
                    type: '',
                  });
                }}
              >
                {t('Add configuration')}
              </Button>
            </FormGroup>
          </FormSection>
          <ErrorHelperText error={generalError} />
        </>
      )}
    </FieldArray>
  );
};

export default ConfigTemplateForm;
