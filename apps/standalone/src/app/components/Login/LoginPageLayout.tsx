import * as React from 'react';
import { Bullseye, Card, CardBody, CardTitle, Stack, StackItem, Title } from '@patternfly/react-core';

import fcLogo from '@fctl-assets/bgimages/flight-control-logo.svg';
import rhemLogo from '@fctl-assets/bgimages/RHEM-logo.svg';
import { useTranslation } from '@flightctl/ui-components/src/hooks/useTranslation';
import { useAppContext } from '@flightctl/ui-components/src/hooks/useAppContext';

const LoginPageLayout = ({ children }: React.PropsWithChildren) => {
  const { t } = useTranslation();
  const { settings } = useAppContext();
  return (
    <Bullseye>
      <Card isLarge style={{ width: '400px', maxWidth: '90vw' }}>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <img
                src={settings.isRHEM ? rhemLogo : fcLogo}
                alt={settings.isRHEM ? 'Red Hat Edge Manager' : 'Flight Control'}
              />
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
