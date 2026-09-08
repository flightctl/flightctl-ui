import * as React from 'react';
import { Button, ModalFooter, ModalHeader, ModalVariant } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import FlightCtlModal from '../../common/FlightCtlModal';
import WithTooltip from '../../common/WithTooltip';
import { StatusDisplayContent } from '../../Status/StatusDisplay';

export const HealthyStatusPreview = ({ label }: { label: string }) => {
  const { t } = useTranslation();
  return <StatusDisplayContent level="success" label={label} message={t('No issues detected.')} />;
};

// This button does not have an action handler as the items in preview are dummy data
export const PreviewButton = ({ title }: { title: string }) => {
  const { t } = useTranslation();
  return (
    <WithTooltip showTooltip content={t('Action not available in preview mode')}>
      <span className="pf-v6-c-button pf-m-link pf-m-inline">{title}</span>
    </WithTooltip>
  );
};

export const SeeHowItLooksPreview = ({ children, title }: React.PropsWithChildren<{ title: string }>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button variant="link" isInline className="pf-v6-u-mb-md" onClick={() => setIsOpen(true)}>
        {t('See how it looks')}
      </Button>
      <FlightCtlModal variant={ModalVariant.large} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader title={title} />
        {children}
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsOpen(false)}>
            {t('Close')}
          </Button>
        </ModalFooter>
      </FlightCtlModal>
    </>
  );
};
