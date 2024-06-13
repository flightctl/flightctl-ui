import * as React from 'react';
import { Label, LabelProps } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';

import { useTranslation } from '../../../hooks/useTranslation';

const SystemdStatus = ({ status }: { status: string | undefined }) => {
  let color: LabelProps['color'];
  let icon: React.ReactNode;

  // TODO Should use <StatusLabel> from https://github.com/flightctl/flightctl-ui/pull/8/
  // TODO We should map the possible status values to its appropriate status color
  const { t } = useTranslation();

  switch (status) {
    case 'running':
      color = 'green';
      icon = <CheckCircleIcon />;
      break;
    default:
      color = 'grey';
      icon = <QuestionCircleIcon />;
      break;
  }

  return (
    <Label color={color} icon={icon}>
      {status || t('Unknown')}
    </Label>
  );
};

export default SystemdStatus;
