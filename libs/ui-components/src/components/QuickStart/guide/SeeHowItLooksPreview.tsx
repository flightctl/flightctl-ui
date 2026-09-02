import * as React from 'react';
import { Button, ModalFooter, ModalHeader, ModalVariant } from '@patternfly/react-core';

import { useTranslation } from '../../../hooks/useTranslation';
import FlightCtlModal from '../../common/FlightCtlModal';
import { StatusDisplayContent } from '../../Status/StatusDisplay';

export const HealthyStatusPreview = ({ label }: { label: string }) => {
  const { t } = useTranslation();
  return <StatusDisplayContent level="success" label={label} message={t('No issues detected.')} />;
};

export const SeeHowItLooksPreview = ({ children, title }: React.PropsWithChildren<{ title: string }>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button variant="link" isInline className="pf-v6-u-mb-md" onClick={() => setIsOpen(true)}>
        {t('See how it looks like')}
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
