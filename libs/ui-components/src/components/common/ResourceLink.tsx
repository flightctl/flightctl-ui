import * as React from 'react';
import { CopyIcon } from '@patternfly/react-icons/dist/js/icons/copy-icon';
import { Button, Icon, Tooltip } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import { Link, type RouteWithPostfix } from '../../hooks/useNavigate';

import './ResourceLink.css';

const maxDisplayLength = 50;

type ResourceDisplayLinkProps = {
  id: string;
  name?: string;
  variant?: 'shortened' | 'full';
  routeLink?: RouteWithPostfix;
};

export const getDisplayText = (name: string | undefined) => {
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

const ResourceLink = ({ id, name, variant = 'shortened', routeLink }: ResourceDisplayLinkProps) => {
  const nameOrId = name || id;
  const displayText = getDisplayText(nameOrId);
  const showCopy = nameOrId !== displayText;

  const textEl = <span className="fctl-resource-link__text">{variant === 'full' ? nameOrId : displayText}</span>;

  return (
    <span className={`fctl-resource-link fctl-resource-link__${variant}`}>
      {routeLink ? <Link to={{ route: routeLink, postfix: id }}>{textEl}</Link> : <>{textEl}</>}
      {showCopy && nameOrId && <CopyNameButton name={nameOrId} />}
    </span>
  );
};

export default ResourceLink;
