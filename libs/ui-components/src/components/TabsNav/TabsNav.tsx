import * as React from 'react';

import { Tabs, TabsProps } from '@patternfly/react-core';
import { useAppContext } from '../../hooks/useAppContext';

type TabsNavProps = {
  children: TabsProps['children'];
  'aria-label'?: string;
  /** List of tab eventKeys - used to determine the active tab. */
  tabKeys: (string | number)[];
};

const TabsNav: React.FC<TabsNavProps> = ({ children, 'aria-label': ariaLabel, tabKeys }) => {
  const {
    router: { useLocation, useNavigate },
  } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState<string>();

  // Update active tab when location changes
  React.useEffect(() => {
    const newActiveTab = tabKeys.find((tabKey) => location.pathname.endsWith(`/${tabKey}`)) || tabKeys[0];
    setActiveTab(String(newActiveTab));
  }, [location.pathname, tabKeys]);

  // Navigate to the selected tab path using absolute path from location.pathname
  // Relative navigate() resolves differently based on the React Router version.
  const handleTabSelect = (_event: React.MouseEvent | React.KeyboardEvent | undefined, tabIndex: string | number) => {
    const tabKey = String(tabIndex);
    setActiveTab(tabKey);

    const pathname = location.pathname.replace(/\/$/, '');
    const isOnTabPath = tabKeys.some((key) => pathname.endsWith(`/${key}`));
    const nextPath = isOnTabPath ? pathname.replace(/\/[^/]+$/, `/${tabKey}`) : `${pathname}/${tabKey}`;
    navigate(nextPath);
  };

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={handleTabSelect}
      aria-label={ariaLabel || 'Details tabs'}
      role="region"
      usePageInsets
    >
      {children}
    </Tabs>
  );
};

export default TabsNav;
