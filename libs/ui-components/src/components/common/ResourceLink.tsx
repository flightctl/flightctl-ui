import * as React from 'react';

import { Link, type RouteWithPostfix } from '../../hooks/useNavigate';
import CopyButton from './CopyButton';

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

const ResourceLink = ({ id, name, variant = 'shortened', routeLink }: ResourceDisplayLinkProps) => {
  const nameOrId = name || id;
  const displayText = getDisplayText(nameOrId);
  const showCopy = nameOrId !== displayText;

  const textEl = <span className="fctl-resource-link__text">{variant === 'full' ? nameOrId : displayText}</span>;

  return (
    <span className={`fctl-resource-link fctl-resource-link__${variant}`}>
      {routeLink ? <Link to={{ route: routeLink, postfix: id }}>{textEl}</Link> : <>{textEl}</>}
      {showCopy && nameOrId && <CopyButton text={nameOrId} />}
    </span>
  );
};

export default ResourceLink;
