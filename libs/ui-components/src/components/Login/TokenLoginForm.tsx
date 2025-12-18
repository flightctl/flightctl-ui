import * as React from 'react';
import {
  Alert,
  Bullseye,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
  Content,
  TextArea,
  ContentVariants,
  Title,
} from '@patternfly/react-core';
import ArrowLeftIcon from '@patternfly/react-icons/dist/js/icons/arrow-left-icon';

import { AuthProvider } from '@flightctl/types';
import { ORGANIZATION_STORAGE_KEY } from '../../utils/organizationStorage';
import { isValidJwtTokenFormat } from '../../utils/k8sProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import { getErrorMessage } from '../../utils/error';
import FlightCtlForm from '../../components/form/FlightCtlForm';

const EXPIRATION = 'expiration';

const nowInSeconds = () => Math.floor(Date.now() / 1000);

type TokenLoginFormProps = {
  provider: AuthProvider;
  onBack?: VoidFunction;
};

const TokenLoginForm = ({ provider, onBack }: TokenLoginFormProps) => {
  const { t } = useTranslation();
  const { proxyFetch } = useFetch();
  const [token, setToken] = React.useState('');
  const [validationError, setValidationError] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      localStorage.removeItem(EXPIRATION);
      localStorage.removeItem(ORGANIZATION_STORAGE_KEY);

      const resp = await proxyFetch(`login?provider=${provider.metadata.name}`, {
        method: 'POST',
        body: JSON.stringify({ token: token.trim() }),
      });

      if (!resp.ok) {
        let errorMessage = t('Authentication failed');
        try {
          const contentType = resp.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = (await resp.json()) as { error?: string };
            errorMessage = errorData.error || errorMessage;
          } else {
            // Fallback for non-JSON responses
            const text = await resp.text();
            if (text) {
              errorMessage = text;
            }
          }
        } catch (parseErr) {
          // If parsing fails, use default error message
          errorMessage = t('Authentication failed');
        }
        setSubmitError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      const expiration = (await resp.json()) as { expiresIn: number };
      if (expiration.expiresIn) {
        const now = nowInSeconds();
        localStorage.setItem(EXPIRATION, `${now + expiration.expiresIn}`);
      }

      // Redirect to home page after successful login
      window.location.href = '/';
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <Bullseye>
      <Card isLarge>
        {onBack && (
          <CardHeader>
            <Button
              variant="link"
              className="pf-v5-u-size-sm"
              onClick={onBack}
              isInline
              isDisabled={isSubmitting}
              icon={<ArrowLeftIcon />}
            >
              {t('Back to login options')}
            </Button>
          </CardHeader>
        )}
        <CardBody>
          <Stack hasGutter style={{ '--pf-v5-l-stack--m-gutter--Gap': '1.5rem' } as React.CSSProperties}>
            <StackItem>
              <Title headingLevel="h2" size="xl">
                {t('Enter your Kubernetes token')}
              </Title>
            </StackItem>

            <StackItem>
              <Content>
                <Content component="p">{t('Enter your Kubernetes service account token to authenticate with the cluster.')}</Content>
                <Content component={ContentVariants.small}>
                  {t('You can find this token in your Kubernetes service account credentials.')}
                </Content>
              </Content>
            </StackItem>
            <StackItem>
              <FlightCtlForm>
                <FormGroup label={t('Service account token')} isRequired>
                  <TextArea
                    id="accessToken"
                    aria-label={t('Service account token')}
                    value={token}
                    onChange={(_event, tokenVal) => {
                      if (tokenVal && !isValidJwtTokenFormat(tokenVal)) {
                        setValidationError(
                          t('Invalid token format. Expected a JWT token with format: header.payload.signature'),
                        );
                      } else {
                        setValidationError('');
                      }
                      if (submitError) {
                        setSubmitError(undefined);
                      }
                      setToken(tokenVal);
                    }}
                    placeholder={t('Enter your Kubernetes token...')}
                    rows={10}
                    isRequired
                    isDisabled={isSubmitting}
                    autoFocus
                    validated={validationError ? 'error' : 'default'}
                  />
                  {validationError && (
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem variant="error">{validationError}</HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  )}
                </FormGroup>

                <Alert variant="warning" title={t('Keep your token secure')} isInline>
                  {t(
                    'Never share your service account token. It provides full access to your Kubernetes cluster resources.',
                  )}
                </Alert>

                {submitError && (
                  <FormSection>
                    <Alert variant="danger" title={t('Authentication failed')} isInline>
                      {submitError}
                    </Alert>
                  </FormSection>
                )}
              </FlightCtlForm>
            </StackItem>
          </Stack>
        </CardBody>
        <CardFooter>
          <Button
            variant="primary"
            isDisabled={!token || !!validationError || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? t('Authenticating...') : t('Login')}
          </Button>
        </CardFooter>
      </Card>
    </Bullseye>
  );
};

export default TokenLoginForm;
