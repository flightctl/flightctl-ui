import * as React from 'react';
import { CopyIcon } from '@patternfly/react-icons/dist/js/icons/copy-icon';
import { Button, Icon, Tooltip } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import { Link, type RouteWithPostfix } from '../../hooks/useNavigate';

import './DisplayName.css';

const maxDisplayLength = 50;

type DisplayNameProps = {
  name: string | undefined;
  variant?: 'shortened' | 'full';
  routeLink?: RouteWithPostfix;
};

export const getDisplayName = (name: string | undefined) => {
  if (!name) {
    return '-';
  }
  if (name.length <= maxDisplayLength) {
    return name;
  }
  return `${name.substring(0, 6)}...${name.substring(name.length - 7)}`;
};

const CopyNameButton = ({ name }: { name: string }) => {
  const { t } = useTranslation();

  const onCopy = () => {
    void navigator.clipboard.writeText(name);
  };

  return (
    <Tooltip content={t('Copy text')}>
      <Button
        variant="plain"
        isInline
        icon={
          <Icon size="sm">
            <CopyIcon onClick={onCopy} />
          </Icon>
        }
        aria-label={t('Copy text')}
      />
    </Tooltip>
  );
};

const DisplayName = ({ name, variant = 'shortened', routeLink }: DisplayNameProps) => {
  const displayText = getDisplayName(name);
  const showCopy = name !== displayText;

  const textEl = <span className="fctl-display-name__text">{variant === 'full' ? name : displayText}</span>;

  return (
    <span className={`fctl-display-name fctl-display-name__${variant}`}>
      {routeLink ? <Link to={{ route: routeLink, postfix: name }}>{textEl}</Link> : <>{textEl}</>}
      {showCopy && name && <CopyNameButton name={name} />}
    </span>
  );
};

export default DisplayName;
