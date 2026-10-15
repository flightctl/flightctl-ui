import * as React from 'react';

import { Link, type RouteWithPostfix } from '../../hooks/useNavigate';
import { getDisplayText } from '../../utils/displayText';
import CopyButton from './CopyButton';

import './ResourceLink.css';

type ResourceDisplayLinkProps = {
  id: string;
  name?: string;
  variant?: 'shortened' | 'full';
  routeLink?: RouteWithPostfix;
  'data-testid'?: string;
};

const ResourceLink = ({
  id,
  name,
  variant = 'shortened',
  routeLink,
  'data-testid': dataTestId,
}: ResourceDisplayLinkProps) => {
  const nameOrId = name || id;
  const displayText = getDisplayText(nameOrId);
  const showCopy = nameOrId !== displayText;

  const textEl = <span className="fctl-resource-link__text">{variant === 'full' ? nameOrId : displayText}</span>;

  return (
    <span className={`fctl-resource-link fctl-resource-link__${variant}`}>
      {routeLink ? (
        <Link to={{ route: routeLink, postfix: id }} data-testid={dataTestId}>
          {textEl}
        </Link>
      ) : (
        <span data-testid={dataTestId}>{textEl}</span>
      )}
      {showCopy && nameOrId && <CopyButton text={nameOrId} />}
    </span>
  );
};

export default ResourceLink;
