import * as React from 'react';

import { Button } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../hooks/useTranslation';

const LearnMoreLink = ({ text, link }: { text?: string; link: string }) => {
  const { t } = useTranslation();
  return (
    <Button
      component="a"
      variant="link"
      isInline
      iconPosition="end"
      icon={<ExternalLinkAltIcon />}
      target="_blank"
      rel="noopener noreferrer"
      href={link}
    >
      {text || t('Learn more')}
    </Button>
  );
};

export default LearnMoreLink;
