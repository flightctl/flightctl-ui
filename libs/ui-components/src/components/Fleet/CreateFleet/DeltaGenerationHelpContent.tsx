import * as React from 'react';
import { Trans } from 'react-i18next';
import { Content, List, ListItem } from '@patternfly/react-core';

import { Link, ROUTE } from '../../../hooks/useNavigate';
import { useTranslation } from '../../../hooks/useTranslation';

const DeltaGenerationHelpContent = () => {
  const { t } = useTranslation();
  return (
    <Content>
      <Content component="p">
        {t(
          'Delta generation runs during fleet rollouts. The platform creates OCI delta artifacts between successive image digests and stores them in a writable registry so devices can pull a smaller update instead of the full artifact.',
        )}
      </Content>
      <Content component="p">{t('To apply deltas')}:</Content>
      <List>
        <ListItem>{t('Devices must report a compatible bootc version and OCI delta support.')}</ListItem>
        <ListItem>
          <Trans t={t}>
            Enable and configure delta artifact storage in an OCI registry in{' '}
            <Link to={ROUTE.REPOSITORIES}>Repositories</Link>
          </Trans>
        </ListItem>
      </List>
      <Content component="p">
        {t('If a delta artifact cannot be applied, the device falls back to the full artifact.')}
      </Content>
    </Content>
  );
};

export default DeltaGenerationHelpContent;
