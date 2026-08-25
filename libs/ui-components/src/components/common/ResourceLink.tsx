import * as React from 'react';

import { Link, type RouteWithPostfix } from '../../hooks/useNavigate';
import TruncatedText from './TruncatedText';

export { getDisplayText } from '../../utils/displayText';

type ResourceDisplayLinkProps = {
  id: string;
  name?: string;
  routeLink?: RouteWithPostfix;
  'data-testid'?: string;
};

const ResourceLink = ({ id, name, routeLink, 'data-testid': dataTestId }: ResourceDisplayLinkProps) => {
  const nameOrId = name || id;

  return (
    <TruncatedText text={nameOrId}>
      {(textContent) =>
        routeLink ? (
          <Link to={{ route: routeLink, postfix: id }} data-testid={dataTestId}>
            {textContent}
          </Link>
        ) : (
          <span data-testid={dataTestId}>{textContent}</span>
        )
      }
    </TruncatedText>
  );
};

export default ResourceLink;
