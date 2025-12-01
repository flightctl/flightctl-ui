import * as React from 'react';
import { FormGroup, FormSection, Split, SplitItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../hooks/useTranslation';
import RadioField from '../../form/RadioField';
import TextField from '../../form/TextField';
import ListItemField from '../../form/ListItemField';
import { FormGroupWithHelperText } from '../../common/WithHelperText';
import { DefaultHelperText } from '../../form/FieldHelperText';
import { AuthProviderFormValues, IntrospectionType } from './types';

const OAuth2IntrospectionSection = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<AuthProviderFormValues>();

  return (
    <FormSection title={t('Token introspection')} className="pf-v5-u-mt-md">
      <FormGroup label={t('Introspection type')}>
        <DefaultHelperText
          helperText={t(
            'Select how to validate OAuth2 tokens. This ensures tokens are properly validated before granting access.',
          )}
        />
        <Split hasGutter>
          <SplitItem>
            <RadioField
              id="introspectionNone"
              name="introspectionType"
              label={t('None')}
              checkedValue={IntrospectionType.None}
              onChangeCustom={() => {
                void setFieldValue('introspectionType', IntrospectionType.None);
                void setFieldValue('introspectionUrl', undefined);
                void setFieldValue('introspectionJwtIssuer', undefined);
                void setFieldValue('introspectionJwtAudience', []);
              }}
              noDefaultOnChange
            />
          </SplitItem>
          <SplitItem>
            <RadioField
              id="introspectionJwt"
              name="introspectionType"
              label={t('JWT')}
              checkedValue={IntrospectionType.Jwt}
              onChangeCustom={() => {
                // We must set the audience field otherwise ListItemField will fail with an undefined value
                void setFieldValue('introspectionJwtAudience', []);
                void setFieldValue('introspectionType', IntrospectionType.Jwt);
              }}
            />
          </SplitItem>
          <SplitItem>
            <RadioField
              id="introspectionRfc7662"
              name="introspectionType"
              label={t('RFC 7662')}
              checkedValue={IntrospectionType.Rfc7662}
            />
          </SplitItem>
          <SplitItem>
            <RadioField
              id="introspectionGitHub"
              name="introspectionType"
              label={t('GitHub')}
              checkedValue={IntrospectionType.GitHub}
            />
          </SplitItem>
        </Split>
      </FormGroup>

      {values.introspectionType === IntrospectionType.Rfc7662 && (
        <FormGroup label={t('Introspection URL')} isRequired>
          <TextField
            name="introspectionUrl"
            aria-label={t('RFC 7662 token introspection endpoint URL')}
            helperText={t('The RFC 7662 token introspection endpoint URL')}
          />
        </FormGroup>
      )}

      {values.introspectionType === IntrospectionType.GitHub && (
        <FormGroup label={t('GitHub API URL')}>
          <TextField
            name="introspectionUrl"
            aria-label={t('GitHub API base URL')}
            helperText={t(
              'The GitHub API base URL. Defaults to https://api.github.com, but can be customized for GitHub Enterprise Server.',
            )}
            placeholder="https://api.github.com"
          />
        </FormGroup>
      )}

      {values.introspectionType === IntrospectionType.Jwt && (
        <>
          <FormGroup label={t('JWKS URL')} isRequired>
            <TextField
              name="introspectionUrl"
              aria-label={t('JWKS endpoint URL')}
              helperText={t(
                'The JWKS (JSON Web Key Set) endpoint URL for fetching public keys to validate JWT signatures',
              )}
            />
          </FormGroup>
          <FormGroup label={t('Issuer')}>
            <TextField
              name="introspectionJwtIssuer"
              aria-label={t('Expected issuer claim value')}
              helperText={t(
                'Expected issuer claim value in the JWT. If not specified, uses the OAuth2 provider issuer.',
              )}
            />
          </FormGroup>
          <FormGroupWithHelperText
            label={t('Audience')}
            content={
              <div>
                <p>{t('Expected audience claim values in the JWT.')}</p>
                <p>{t('If not specified, uses the OAuth2 provider client ID.')}</p>
              </div>
            }
          >
            <ListItemField
              name="introspectionJwtAudience"
              helperText={t('Add audience claim values')}
              addButtonText={t('Add audience')}
            />
          </FormGroupWithHelperText>
        </>
      )}
    </FormSection>
  );
};

export default OAuth2IntrospectionSection;
