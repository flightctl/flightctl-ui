import * as React from 'react';

import {
  Alert,
  Bullseye,
  Button,
  ExpandableSection,
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
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { RepoSpecType, Repository, RepositoryList } from '@flightctl/types';
import { SpecConfigTemplate } from '../../../../types/deviceSpec';
import { DeviceSpecConfigFormValues } from '../types';

import { useTranslation } from '../../../../hooks/useTranslation';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import { getErrorMessage } from '../../../../utils/error';
import { sortByName } from '../../../../utils/sort/generic';
import WithTooltip from '../../../common/WithTooltip';
import { getDnsSubdomainValidations } from '../../../form/validations';
import ErrorHelperText from '../../../form/FieldHelperText';
import FormSelect from '../../../form/FormSelect';
import RichValidationTextField from '../../../form/RichValidationTextField';
import ConfigWithRepositoryTemplateForm from './ConfigWithRepositoryTemplateForm';
import ConfigK8sSecretTemplateForm from './ConfigK8sSecretTemplateForm';
import ConfigInlineTemplateForm from './ConfigInlineTemplateForm';

import './ConfigTemplateForm.css';

const useValidateOnMount = () => {
  const { validateForm } = useFormikContext<DeviceSpecConfigFormValues>();

  // validate new config section on mount
  React.useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

type ConfigSectionProps = {
  ct: SpecConfigTemplate;
  index: number;
  repositories: Repository[];
  repoRefetch: VoidFunction;
};

const ConfigSection = ({ ct, index, repositories, repoRefetch }: ConfigSectionProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const fieldName = `configTemplates[${index}]`;
  const { setFieldTouched } = useFormikContext<DeviceSpecConfigFormValues>();
  const [{ value: template }, { error }, { setTouched }] = useField<SpecConfigTemplate>(fieldName);

  useValidateOnMount();

  return (
    <ExpandableSection
      toggleContent={
        <Split hasGutter>
          <SplitItem>{t('Configurations/applications')}</SplitItem>
          {!isExpanded && !!template.name && <SplitItem style={{ color: 'black' }}>{template.name}</SplitItem>}
          {!isExpanded && error && (
            <SplitItem>
              <WithTooltip showTooltip content={t('Invalid configuration')}>
                <ExclamationCircleIcon className="fctl-config-template--error" />
              </WithTooltip>
            </SplitItem>
          )}
        </Split>
      }
      isIndented
      isExpanded={isExpanded}
      onToggle={(_, expanded) => {
        setTouched(true);
        Object.keys((error as unknown as object) || {}).forEach((key) => {
          setFieldTouched(`${fieldName}.${key}`, true);
        });
        setIsExpanded(expanded);
      }}
    >
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
              git: t('Git config provider'),
              http: t('Http config provider'),
              // secret: t('Kubernetes secret provider'), not supported yet
              inline: t('Inline config provider'),
            }}
            name={`${fieldName}.type`}
            placeholderText={t('Select a source type')}
          />
        </FormGroup>
        {ct.type === 'secret' && <ConfigK8sSecretTemplateForm index={index} />}
        {ct.type === 'inline' && <ConfigInlineTemplateForm index={index} />}
        {(ct.type === 'http' || ct.type === 'git') && (
          <ConfigWithRepositoryTemplateForm
            repoType={ct.type as RepoSpecType}
            index={index}
            repositories={repositories}
            repoRefetch={repoRefetch}
          />
        )}
      </Grid>
    </ExpandableSection>
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
                    type: '',
                  });
                }}
              >
                {t('Add configurations/applications')}
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
