import * as React from 'react';
import { Alert, Button, Divider, FormGroup, FormSection, Grid, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';

import { AuthProvider } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import NameField from '../../form/NameField';
import TextField from '../../form/TextField';
import SwitchField from '../../form/SwitchField';
import ListItemField from '../../form/ListItemField';
import FlightCtlForm from '../../form/FlightCtlForm';
import FlightCtlActionGroup from '../../form/FlightCtlActionGroup';
import { getDnsSubdomainValidations } from '../../form/validations';
import { AuthProviderFormValues, FieldValidationResult } from './types';
import { ProviderType } from '../../../types/extraTypes';

import { authProviderSchema, getAuthProvider, getAuthProviderPatches, getInitValues } from './utils';
import { getErrorMessage } from '../../../utils/error';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import { FormGroupWithHelperText } from '../../common/WithHelperText';

import Oauth2ProviderFields from './Oauth2ProviderFields';
import OrganizationAssignmentSection from './AuthOrganizationAssignment';
import RoleAssignmentSection from './RoleAssignmentSection';
import TestConnectionModal from '../TestConnectionModal/TestConnectionModal';
import { ScopesHelperText, UsernameClaimHelperText } from './AuthProviderHelperText';

const EnabledHelpText = () => {
  const { t } = useTranslation();
  return (
    <Popover
      bodyContent={
        <div>
          <p>{t('Turn this on to let users sign in with this provider.')}</p>
          <p>{t('You can turn it off anytime without losing your settings.')}</p>
        </div>
      }
      withFocusTrap
      triggerAction="click"
    >
      <Button
        icon={<OutlinedQuestionCircleIcon />}
        component="a"
        className="fctl-helper-text__icon"
        isInline
        variant="plain"
        onClick={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
        }}
        aria-label="Enabled help text"
      />
    </Popover>
  );
};

export const AuthProviderForm = ({ isEdit }: { isEdit?: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<AuthProviderFormValues>();

  const isOidcProvider = values.providerType === ProviderType.OIDC;

  return (
    <>
      <SwitchField
        name="enabled"
        label={t('Enabled')}
        aria-label={t('Enabled provider')}
        labelIcon={<EnabledHelpText />}
      />

      <NameField
        name="name"
        aria-label={t('Provider name')}
        isRequired
        isDisabled={isEdit}
        resourceType="authproviders"
        validations={getDnsSubdomainValidations(t)}
        helperText={t("You can't change the provider name after it's created")}
      />

      <FormGroup label={t('Display name')}>
        <TextField name="displayName" aria-label={t('Display name')} helperText={t('Display name for this provider')} />
      </FormGroup>

      {values.providerType === ProviderType.OAuth2 && <Oauth2ProviderFields />}

      <FormSection title={t('OIDC')}>
        <FormGroup label={t('Issuer URL')} isRequired={isOidcProvider}>
          <TextField name="issuer" aria-label={t('Issuer URL')} />
        </FormGroup>

        <FormGroup label={t('Client ID')} isRequired>
          <TextField name="clientId" aria-label={t('Client ID')} />
        </FormGroup>

        <FormGroup label={t('Client secret')} isRequired>
          <TextField name="clientSecret" aria-label={t('Client secret')} type="password" />
        </FormGroup>
      </FormSection>

      <Divider style={{ margin: '2rem 0 1rem' }} />

      <FormSection title={t('User identity & authorization')}>
        <FormGroupWithHelperText label={t('Scopes')} content={<ScopesHelperText />}>
          <ListItemField
            name="scopes"
            helperText={t('Add scopes required to access username and role claims from your authentication provider.')}
            addButtonText={t('Add scope')}
          />
        </FormGroupWithHelperText>

        <FormGroupWithHelperText label={t('Username claim path')} content={<UsernameClaimHelperText />}>
          <ListItemField
            name="usernameClaim"
            helperText={t('Enter the path segments to the username claim')}
            addButtonText={t('Add path segment')}
            resolvedValue={(items) => items.join('.')}
            resolvedLabel={t('Resulting username claim')}
          />
        </FormGroupWithHelperText>
      </FormSection>

      <RoleAssignmentSection />

      <Divider style={{ margin: '2rem 0 1rem' }} />

      <OrganizationAssignmentSection />
    </>
  );
};

const CreateAuthProviderFormContent = ({
  isEdit,
  onClose,
  children,
}: React.PropsWithChildren<{
  onClose: VoidFunction;
  isEdit: boolean;
}>) => {
  const { t } = useTranslation();
  const { isValid, dirty, submitForm, isSubmitting, values } = useFormikContext<AuthProviderFormValues>();
  const { proxyFetch } = useFetch();

  const [isTesting, setIsTesting] = React.useState(false);
  const [testResults, setTestResults] = React.useState<FieldValidationResult[] | null>(null);
  const [testError, setTestError] = React.useState<string>();
  const isSubmitDisabled = isSubmitting || !isValid || !dirty;
  const isTestingDisabled = isSubmitting || !isValid || isTesting || (!isEdit && !dirty);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestError(undefined);

    try {
      const requestBody = {
        providerType: values.providerType,
        issuer: values.issuer,
        authorizationUrl: values.authorizationUrl,
        tokenUrl: values.tokenUrl,
        userinfoUrl: values.userinfoUrl,
        clientId: values.clientId,
      };

      const response = await proxyFetch('test-auth-provider-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const data = (await response.json()) as { results: FieldValidationResult[] };
      setTestResults(data.results);
    } catch (err) {
      setTestError(getErrorMessage(err));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <FlightCtlForm>
      <Grid hasGutter span={8}>
        <AuthProviderForm isEdit={isEdit} />
      </Grid>
      {children}
      {testError && (
        <Alert isInline variant="danger" title={t('Test connection failed')}>
          {testError}
        </Alert>
      )}
      <FlightCtlActionGroup>
        <Button variant="primary" onClick={submitForm} isLoading={isSubmitting} isDisabled={isSubmitDisabled}>
          {isEdit ? t('Save') : t('Create authentication provider')}
        </Button>
        <Button variant="secondary" onClick={handleTestConnection} isLoading={isTesting} isDisabled={isTestingDisabled}>
          {t('Test connection')}
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={onClose}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
      {testResults && <TestConnectionModal onClose={() => setTestResults(null)} results={testResults} />}
    </FlightCtlForm>
  );
};

export type CreateAuthProviderFormProps = {
  onClose: VoidFunction;
  onSuccess: (authProvider: AuthProvider) => void;
  authProvider?: AuthProvider;
};

const CreateAuthProviderForm = ({ authProvider, onClose, onSuccess }: CreateAuthProviderFormProps) => {
  const { t } = useTranslation();
  const { patch, post } = useFetch();
  const [error, setError] = React.useState<string>();

  return (
    <Formik<AuthProviderFormValues>
      initialValues={getInitValues(authProvider)}
      validationSchema={Yup.lazy(authProviderSchema(t))}
      onSubmit={async (values) => {
        setError(undefined);
        if (authProvider) {
          const patches = getAuthProviderPatches(values, authProvider);
          try {
            if (patches.length) {
              await patch<AuthProvider>(`authproviders/${authProvider.metadata.name}`, patches);
              onSuccess(authProvider);
            }
          } catch (e) {
            setError(getErrorMessage(e));
          }
        } else {
          try {
            const provider = await post<AuthProvider>('authproviders', getAuthProvider(values));
            onSuccess(provider);
          } catch (e) {
            setError(getErrorMessage(e));
          }
        }
      }}
    >
      <CreateAuthProviderFormContent isEdit={!!authProvider} onClose={onClose}>
        {error && (
          <Alert isInline variant="danger" title={t('An error occurred')}>
            {error}
          </Alert>
        )}
        <LeaveFormConfirmation />
      </CreateAuthProviderFormContent>
    </Formik>
  );
};

export default CreateAuthProviderForm;
