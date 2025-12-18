import * as React from 'react';
import {
  Card,
  CardBody,
  ClipboardCopy,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Label,
  LabelGroup,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { AuthProvider } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { DEFAULT_USERNAME_CLAIM, OrgAssignmentType, isOAuth2Provider } from '../CreateAuthProvider/types';
import { getAssignmentTypeLabel, getProviderTypeLabel } from '../CreateAuthProvider/utils';
import RoleAssigmentDetails from './RoleAssigmentDetails';
import { DynamicAuthProviderSpec } from '../../../types/extraTypes';

const Scopes = ({ scopes }: { scopes: string[] | undefined }) => {
  if (!scopes || scopes.length === 0) {
    return 'N/A';
  }
  return (
    <LabelGroup>
      {scopes.map((scope, index) => (
        <Label key={`${scope}-${index}`}>{scope}</Label>
      ))}
    </LabelGroup>
  );
};

const CopyUrl = ({ url }: { url: string }) => {
  return (
    <ClipboardCopy variant="inline-compact" isCode>
      {url || 'N/A'}
    </ClipboardCopy>
  );
};

const AuthProviderDetailsTab = ({ authProvider }: { authProvider: AuthProvider }) => {
  const { t } = useTranslation();
  // Dynamic auth providers can only be OAuth2 or OIDC
  const spec = authProvider.spec as DynamicAuthProviderSpec;
  const isOAuth2 = isOAuth2Provider(spec);
  const orgAssignment = spec.organizationAssignment;
  const isEnabled = spec.enabled ?? true;

  return (
    <Stack hasGutter>
      {/* Provider Overview Card */}
      <StackItem>
        <Card>
          <CardBody>
            <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
              {t('Provider overview')}
            </Title>
            <DescriptionList columnModifier={{ default: '2Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <strong>{authProvider.metadata.name}</strong>
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>{t('Display name')}</DescriptionListTerm>
                <DescriptionListDescription>{spec.displayName || 'N/A'}</DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label color="blue">{getProviderTypeLabel(spec.providerType, t)}</Label>
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label color={isEnabled ? 'green' : 'grey'}>{isEnabled ? t('Enabled') : t('Disabled')}</Label>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>

            <Divider style={{ margin: '24px 0' }} />

            <DescriptionList>
              <Title headingLevel="h2" className="pf-v5-u-mb-md">
                {t('{{ providerType }} configuration', { providerType: spec.providerType })}
              </Title>
              {isOAuth2 && (
                <>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Authorization URL')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <CopyUrl url={spec.authorizationUrl} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Token URL')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <CopyUrl url={spec.tokenUrl} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>

                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Userinfo URL')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <CopyUrl url={spec.userinfoUrl} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </>
              )}

              <DescriptionListGroup>
                <DescriptionListTerm>{t('Issuer URL')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {spec.issuer ? <CopyUrl url={spec.issuer} /> : 'N/A'}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardBody>
            <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
              {t('Client & claims configuration')}
            </Title>
            <DescriptionList columnModifier={{ default: '2Col' }}>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Client ID')}</DescriptionListTerm>
                <DescriptionListDescription>{spec.clientId}</DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>{t('Scopes')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <Scopes scopes={spec.scopes} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Username claim path')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {spec.usernameClaim?.length ? (
                    <>
                      <LabelGroup>{spec.usernameClaim?.map((claim) => <Label key={claim}>{claim}</Label>)}</LabelGroup>
                      <Content>
                        <Content component={ContentVariants.small}>
                          {t('Resulting username claim')}: <strong>{spec.usernameClaim.join('.')}</strong>
                        </Content>
                      </Content>
                    </>
                  ) : (
                    <Label color="grey">{`${DEFAULT_USERNAME_CLAIM} - (${t('Default')})`}</Label>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>

              <DescriptionListGroup>
                <DescriptionListTerm>{t('Role assignment')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <RoleAssigmentDetails roleAssignment={spec.roleAssignment} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardBody>
            <Title headingLevel="h2" size="lg" className="pf-v5-u-mb-md">
              {t('Organization assignment')}
            </Title>
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Assignment type')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label color="purple">{getAssignmentTypeLabel(orgAssignment.type, t)}</Label>
                </DescriptionListDescription>
              </DescriptionListGroup>
              {orgAssignment.type === OrgAssignmentType.Static && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Organization')}</DescriptionListTerm>
                  <DescriptionListDescription>{orgAssignment.organizationName || 'N/A'}</DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {orgAssignment.type === OrgAssignmentType.Dynamic && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Claim path')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <LabelGroup>
                      {orgAssignment.claimPath.map((pathSegment, index) => (
                        <Label key={`${pathSegment}-${index}`}>{pathSegment}</Label>
                      ))}
                    </LabelGroup>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {(orgAssignment.type === OrgAssignmentType.Dynamic ||
                orgAssignment.type === OrgAssignmentType.PerUser) && (
                <>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Prefix')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {orgAssignment.organizationNamePrefix || 'N/A'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Suffix')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {orgAssignment.organizationNameSuffix || 'N/A'}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </>
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>
    </Stack>
  );
};

export default AuthProviderDetailsTab;
