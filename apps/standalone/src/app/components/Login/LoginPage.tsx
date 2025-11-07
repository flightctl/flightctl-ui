import * as React from 'react';
import {
  Alert,
  Bullseye,
  Button,
  Card,
  CardBody,
  CardFooter,
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
  Text,
  TextArea,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';

import { ORGANIZATION_STORAGE_KEY } from '@flightctl/ui-components/src/utils/organizationStorage';
import FlightCtlForm from '@flightctl/ui-components/src/components/form/FlightCtlForm';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';
import { loginAPI } from '../../utils/apiCalls';

const EXPIRATION = 'expiration';

const nowInSeconds = () => Math.floor(Date.now() / 1000);

// Simple JWT format validation - checks if token has 3 parts separated by dots
export const isValidJwtTokenFormat = (token: string): boolean => {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  // Check that each part contains only valid base64url characters
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  return parts.every((part) => part.length > 0 && base64urlPattern.test(part));
};

export const LoginPage = () => {
  const { t } = useTranslation();
  const [token, setToken] = React.useState('');
  const [validationError, setValidationError] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(undefined);
    setIsSubmitting(true);

    try {
      localStorage.removeItem(EXPIRATION);
      localStorage.removeItem(ORGANIZATION_STORAGE_KEY);

      const resp = await fetch(loginAPI, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({
          token: token.trim(),
        }),
      });

      if (!resp.ok) {
        const errorData = (await resp.json()) as { error?: string };
        setSubmitError(errorData.error || t('Authentication failed'));
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
      setSubmitError(t('Failed to authenticate. Please check your token and try again.'));
      setIsSubmitting(false);
    }
  };

  return (
    <Bullseye>
      <Card isLarge>
        <CardBody>
          <Stack hasGutter style={{ '--pf-v5-l-stack--m-gutter--Gap': '1.5rem' } as React.CSSProperties}>
            <StackItem>
              <Title headingLevel="h2" size="xl">
                {t('Enter your Kubernetes token')}
              </Title>
            </StackItem>

            <StackItem>
              <TextContent>
                <Text>{t('Enter your Kubernetes service account token to authenticate with the cluster.')}</Text>
                <Text component={TextVariants.small}>
                  {t('You can find this token in your Kubernetes service account credentials.')}
                </Text>
              </TextContent>
            </StackItem>
            <StackItem>
              <FlightCtlForm>
                <FormGroup label={t('Service account token')} isRequired>
                  <TextArea
                    id="accessToken"
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
