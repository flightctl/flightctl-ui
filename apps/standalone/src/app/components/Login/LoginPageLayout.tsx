import * as React from 'react';
import { Bullseye, Page, PageSection } from '@patternfly/react-core';

const LoginPageLayout = ({ children }: React.PropsWithChildren) => {
  // CELIA-WIP check if theme is applied correctly
  return (
    <Page>
      <PageSection hasBodyWrapper={false} type="default" isFilled>
        <Bullseye>{children}</Bullseye>
      </PageSection>
    </Page>
  );
};

export default LoginPageLayout;
