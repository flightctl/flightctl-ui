import * as React from 'react';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { Button } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';

export const KubernetesLabelHelperText = () => {
  const { t } = useTranslation();
  return (
    <>
      {t('Must be a valid Kubernetes label')}{' '}
      <Button
        component="a"
        variant="link"
        isInline
        icon={<ExternalLinkAltIcon />}
        target="_blank"
        rel="noopener noreferrer"
        href="https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/"
      >
        {t('Learn more')}
      </Button>
    </>
  );
};

export const IgnitionFileHelperText = () => {
  const { t } = useTranslation();
  return (
    <>
      {t('Must be a valid Ignition file in YAML format')}{' '}
      <Button
        component="a"
        variant="link"
        isInline
        icon={<ExternalLinkAltIcon />}
        target="_blank"
        rel="noopener noreferrer"
        href="https://coreos.github.io/ignition/specs/"
      >
        {t('Learn more')}
      </Button>
    </>
  );
};
