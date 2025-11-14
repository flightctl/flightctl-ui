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
import { ConfigType, DeviceSpecConfigFormValues, SpecConfigTemplate } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import { getErrorMessage } from '../../../../utils/error';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import { getDnsSubdomainValidations } from '../../../form/validations';
import ErrorHelperText from '../../../form/FieldHelperText';
import FormSelect from '../../../form/FormSelect';
import RichValidationTextField from '../../../form/RichValidationTextField';
import ConfigWithRepositoryTemplateForm from './ConfigWithRepositoryTemplateForm';
import ConfigK8sSecretTemplateForm from './ConfigK8sSecretTemplateForm';
import ConfigInlineTemplateForm from './ConfigInlineTemplateForm';
import ExpandableFormSection from '../../../form/ExpandableFormSection';
import { useAccessReview } from '../../../../hooks/useAccessReview';
import { RESOURCE, VERB } from '../../../../types/rbac';

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
  canCreateRepo: boolean;
  canListRepo: boolean;
  isReadOnly?: boolean;
};

const ConfigSection = ({
  index,
  repositories,
  repoRefetch,
  isReadOnly,
  canCreateRepo,
  canListRepo,
}: ConfigSectionProps & { index: number }) => {
  const { t } = useTranslation();
  const fieldName = `configTemplates[${index}]`;
  const [
    {
      value: { name, type },
    },
  ] = useField<SpecConfigTemplate>(fieldName);

  useValidateOnMount();

  const items = React.useMemo(() => {
    const allOptions = {
      [ConfigType.INLINE]: { label: t('Inline configuration') },
      [ConfigType.GIT]: { label: t('Git configuration') },
      [ConfigType.HTTP]: { label: t('Http configuration') },
      [ConfigType.K8S_SECRET]: { label: t('Kubernetes secret') },
    };
    if (isReadOnly) {
      return {
        [type]: allOptions[type],
      };
    }

    const options = {
      [ConfigType.INLINE]: allOptions[ConfigType.INLINE],
    };
    if (canListRepo && (canCreateRepo || repositories.length > 0)) {
      options[ConfigType.GIT] = allOptions[ConfigType.GIT];
      options[ConfigType.HTTP] = allOptions[ConfigType.HTTP];
    }
    if (type === ConfigType.K8S_SECRET) {
      options[ConfigType.K8S_SECRET] = allOptions[ConfigType.K8S_SECRET];
    }

    return options;
    // The k8s secret option must remain active for this config even when the users switch the configType to a different one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, canListRepo, isReadOnly]);

  return (
    <ExpandableFormSection
      title={t('Configuration {{ configNum }}', { configNum: index + 1 })}
      fieldName={fieldName}
      description={name}
    >
      <Grid hasGutter>
        <RichValidationTextField
          isDisabled={isReadOnly}
          fieldName={`${fieldName}.name`}
          aria-label={t('Source name')}
          validations={getDnsSubdomainValidations(t)}
          isRequired
        />

        <FormGroup label={t('Source type')} isRequired>
          <FormSelect
            items={items}
            name={`${fieldName}.type`}
            placeholderText={t('Select a source type')}
            isDisabled={isReadOnly}
          />
        </FormGroup>

        {type === ConfigType.K8S_SECRET && <ConfigK8sSecretTemplateForm index={index} />}
        {type === ConfigType.INLINE && <ConfigInlineTemplateForm index={index} isReadOnly={isReadOnly} />}
        {(type === ConfigType.GIT || type === ConfigType.HTTP) && (
          <ConfigWithRepositoryTemplateForm
            repoType={type === ConfigType.HTTP ? RepoSpecType.HTTP : RepoSpecType.GIT}
            index={index}
            isReadOnly={isReadOnly}
            canCreateRepo={canCreateRepo}
            repositories={repositories}
            repoRefetch={repoRefetch}
          />
        )}
      </Grid>
    </ExpandableFormSection>
  );
};

const ConfigurationTemplatesForm = ({
  repositories,
  repoRefetch,
  isReadOnly,
  canCreateRepo,
  canListRepo,
}: ConfigSectionProps) => {
  const { t } = useTranslation();
  const { values, errors } = useFormikContext<DeviceSpecConfigFormValues>();
  if (isReadOnly && values.configTemplates.length === 0) {
    return null;
  }

  const generalError = typeof errors.configTemplates === 'string' ? errors.configTemplates : undefined;

  return (
    <FormGroupWithHelperText
      label={t('Host configurations (files)')}
      content={t(
        "Define configuration files that shall be present on the device's file system. For example: systemd service config, network config, firewall config, etc.",
      )}
    >
      <FieldArray name="configTemplates">
        {({ push, remove }) => (
          <>
            {values.configTemplates.map((_, index) => (
              <FormSection key={index}>
                <Split hasGutter>
                  <SplitItem isFilled>
                    <ConfigSection
                      index={index}
                      isReadOnly={isReadOnly}
                      canCreateRepo={canCreateRepo}
                      repositories={repositories}
                      repoRefetch={repoRefetch}
                      canListRepo={canListRepo}
                    />
                  </SplitItem>
                  {!isReadOnly && (
                    <SplitItem>
                      <Button
                        aria-label={t('Delete configuration')}
                        variant="link"
                        icon={<MinusCircleIcon />}
                        iconPosition="start"
                        onClick={() => remove(index)}
                      />
                    </SplitItem>
                  )}
                </Split>
              </FormSection>
            ))}
            {!isReadOnly && (
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
            )}
            <ErrorHelperText error={generalError} />
          </>
        )}
      </FieldArray>
    </FormGroupWithHelperText>
  );
};

const ConfigurationTemplates = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const [permissions] = useAccessReview([{ kind: RESOURCE.REPOSITORY, verb: VERB.CREATE }]);
  const [canCreateRepo = false] = permissions;
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
    <ConfigurationTemplatesForm
      isReadOnly={isReadOnly}
      canListRepo
      canCreateRepo={canCreateRepo}
      repositories={repositories}
      repoRefetch={refetch}
    />
  );
};

const ConfigurationTemplatesWithPermissions = ({ isReadOnly }) => {
  const [permissions] = useAccessReview([{ kind: RESOURCE.REPOSITORY, verb: VERB.LIST }]);
  const [canListRepo = false] = permissions;
  return canListRepo && !isReadOnly ? (
    <ConfigurationTemplates />
  ) : (
    <ConfigurationTemplatesForm
      isReadOnly
      canListRepo={false}
      canCreateRepo={false}
      repositories={[]}
      repoRefetch={() => {}}
    />
  );
};

export default ConfigurationTemplatesWithPermissions;
