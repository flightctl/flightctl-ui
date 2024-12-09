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
import { ConfigType, SpecConfigTemplate } from '../../../../types/deviceSpec';
import { DeviceSpecConfigFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import { getErrorMessage } from '../../../../utils/error';
import WithHelperText from '../../../common/WithHelperText';
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
  repositories: Repository[];
  repoRefetch: VoidFunction;
};

const ConfigSection = ({ index, repositories, repoRefetch }: ConfigSectionProps & { index: number }) => {
  const { t } = useTranslation();
  const fieldName = `configTemplates[${index}]`;
  const [
    {
      value: { name, type },
    },
  ] = useField<SpecConfigTemplate>(fieldName);

  useValidateOnMount();

  const items = React.useMemo(() => {
    const options = {
      [ConfigType.GIT]: { label: t('Git configuration') },
      [ConfigType.HTTP]: { label: t('Http configuration') },
      [ConfigType.INLINE]: { label: t('Inline configuration') },
    };
    if (type === ConfigType.K8S_SECRET) {
      options[ConfigType.K8S_SECRET] = { label: t('Kubernetes secret provider') };
    }
    return options;
    // The k8s secret option must remain active for this config even when the users switch the configType to a different one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  return (
    <ExpandableFormSection
      title={t('Configuration {{ configNum }}', { configNum: index + 1 })}
      fieldName={fieldName}
      description={name}
    >
      <Grid hasGutter>
        <RichValidationTextField
          fieldName={`${fieldName}.name`}
          aria-label={t('Source name')}
          validations={getDnsSubdomainValidations(t)}
          isRequired
        />

        <FormGroup label={t('Source type')} isRequired>
          <FormSelect items={items} name={`${fieldName}.type`} placeholderText={t('Select a source type')} />
        </FormGroup>

        {type === ConfigType.K8S_SECRET && <ConfigK8sSecretTemplateForm index={index} />}
        {type === ConfigType.INLINE && <ConfigInlineTemplateForm index={index} />}
        {(type === ConfigType.GIT || type === ConfigType.HTTP) && (
          <ConfigWithRepositoryTemplateForm
            repoType={type === ConfigType.HTTP ? RepoSpecType.HTTP : RepoSpecType.GIT}
            index={index}
            repositories={repositories}
            repoRefetch={repoRefetch}
          />
        )}
      </Grid>
    </ExpandableFormSection>
  );
};

const ConfigurationTemplatesForm = ({ repositories, repoRefetch }: ConfigSectionProps) => {
  const { t } = useTranslation();
  const { values, errors } = useFormikContext<DeviceSpecConfigFormValues>();

  const generalError = typeof errors.configTemplates === 'string' ? errors.configTemplates : undefined;

  return (
    <FieldArray name="configTemplates">
      {({ push, remove }) => (
        <>
          {values.configTemplates.map((_, index) => (
            <FormSection key={index}>
              <Split hasGutter>
                <SplitItem isFilled>
                  <ConfigSection index={index} repositories={repositories} repoRefetch={repoRefetch} />
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

const ConfigurationTemplates = () => {
  const [repositoryList, isLoading, error, refetch] = useFetchPeriodically<RepositoryList>({
    endpoint: 'repositories',
  });

  const repositories = repositoryList?.items || [];

  const { t } = useTranslation();

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
    <FormGroup
      label={
        <WithHelperText
          ariaLabel={t('Configurations')}
          content={t("Define configuration files that shall be present on the device's file system.")}
          showLabel
        />
      }
    >
      <ConfigurationTemplatesForm repositories={repositories} repoRefetch={refetch} />
    </FormGroup>
  );
};

export default ConfigurationTemplates;
