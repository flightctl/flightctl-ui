import * as React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Wrapper around React.lazy that creates a fresh lazy loader on each router navigation.
 * Prevents the lazy loader from being cached by React.lazy
 */
export function lazyResetter(importer: () => Promise<{ default: React.ComponentType }>): React.FC {
  function ResettableLazyPage() {
    const { key: locationKey } = useLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: recreate lazy when location.key changes
    const Component = React.useMemo(() => React.lazy(importer), [locationKey]);
    return <Component />;
  }

  return ResettableLazyPage;
}
