import * as React from 'react';
import { Bullseye, Card, CardBody, CardTitle, Stack, StackItem, Title } from '@patternfly/react-core';

import { useBrandLogo } from '../../hooks/useBrandLogo';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';

const LoginPageLayout = ({ children }: React.PropsWithChildren) => {
  const { t } = useTranslation();
  const { logo, altText } = useBrandLogo();

  return (
    <Bullseye>
      <Card isLarge style={{ width: '400px', maxWidth: '90vw' }}>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <img src={logo} alt={altText} />
            </StackItem>

            <StackItem>
              <CardTitle>
                <Title headingLevel="h2" size="lg">
                  {t('Choose login method')}
                </Title>
              </CardTitle>
            </StackItem>

            <StackItem>{children}</StackItem>
          </Stack>
        </CardBody>
      </Card>
    </Bullseye>
  );
};

export default LoginPageLayout;
