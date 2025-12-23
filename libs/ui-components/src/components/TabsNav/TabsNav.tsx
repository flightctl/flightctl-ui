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

  // Handle tab selection and navigate to the corresponding route
  const handleTabSelect = (_event: React.MouseEvent | React.KeyboardEvent | undefined, tabIndex: string | number) => {
    const tabKey = String(tabIndex);
    setActiveTab(tabKey);
    // Navigate to the relative path
    navigate(tabKey);
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
