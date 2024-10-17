import * as React from 'react';
import { Badge } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import { usePendingEnrollmentRequestsCount } from '../../hooks/usePendingEnrollmentRequestsCount';

import './PendingEnrollmentRequestsBadge.css';

const PendingEnrollmentRequestsBadge = () => {
  const { t } = useTranslation();
  const [count] = usePendingEnrollmentRequestsCount();
  if (count === 0) {
    return null;
  }
  return (
    <Badge className="fctl-separator--left" screenReaderText={t('{{ count }} devices pending approval', { count })}>
      {count}
    </Badge>
  );
};

export default PendingEnrollmentRequestsBadge;
