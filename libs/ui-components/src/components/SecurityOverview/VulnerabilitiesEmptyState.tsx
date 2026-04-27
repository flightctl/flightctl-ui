import * as React from 'react';

import { Alert } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

const VulnerabilitiesEmptyState = ({ hasDevices }: { hasDevices: boolean }) => {
  const { t } = useTranslation();

  if (hasDevices) {
    return (
      <Alert variant="success" title={t('No CVEs detected')}>
        {t(
          'All managed devices have been scanned. No CVEs were found affecting images currently deployed across your fleets and devices.',
        )}
      </Alert>
    );
  }

  return (
    <Alert variant="info" title={t('No vulnerability data to display.')}>
      {t('There are currently no deployed devices. Scan results will be available once devices have been added.')}
    </Alert>
  );
};

export default VulnerabilitiesEmptyState;
