import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Drawer, DrawerContent, DrawerContentBody, DrawerPanelContent } from '@patternfly/react-core';
import { createPortal } from 'react-dom';

import { useTranslation } from '../../hooks/useTranslation';

type PageDrawerProps = {
  panelContent: React.ReactNode;
  isExpanded: boolean;
};

const getPageContentTop = () => {
  const masthead =
    document.getElementById('stack-inline-masthead') || // Standalone masthead
    document.getElementById('page-main-header'); // OCP Console masthead
  const pageTop = document.getElementById('fctl-cmd-panel');

  return masthead?.getBoundingClientRect()?.bottom || pageTop?.getBoundingClientRect()?.top || 60;
};

const usePageContentTop = () => {
  const [topOffset, setTopOffset] = React.useState(() => getPageContentTop());

  React.useEffect(() => {
    const measureTop = () => {
      setTopOffset(getPageContentTop());
    };

    measureTop();
    const timeoutId = setTimeout(measureTop, 50);

    window.addEventListener('resize', measureTop);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measureTop);
    };
  }, []);

  return topOffset;
};

const drawerWidths = {
  '2xl': 'width_25',
  xl: 'width_33',
  lg: 'width_50',
  default: 'width_100',
} as const;

// Wraps the content to re-enable pointer events so that "close" button works.
const FlightCtlPageDrawerContent = ({ children }: React.PropsWithChildren) => {
  const { t } = useTranslation();
  return (
    <DrawerPanelContent
      defaultSize="500px"
      minSize="500px"
      maxSize="1200px"
      widths={drawerWidths}
      isResizable
      resizeAriaLabel={t('Resize panel')}
      style={{
        pointerEvents: 'auto',
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      {children}
    </DrawerPanelContent>
  );
};

const FlightCtlPageDrawer = ({ isExpanded, panelContent }: PageDrawerProps) => {
  const topOffset = usePageContentTop();

  const drawerOverlay = isExpanded ? (
    <div
      style={{
        position: 'fixed',
        top: `${topOffset}px`,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 400,
        pointerEvents: 'none',
      }}
    >
      <Drawer isExpanded isInline position="end" style={{ height: '100%', width: '100%', pointerEvents: 'none' }}>
        <DrawerContent panelContent={<FlightCtlPageDrawerContent>{panelContent}</FlightCtlPageDrawerContent>}>
          <DrawerContentBody
            style={{
              background: 'transparent',
              pointerEvents: 'none',
            }}
          />
        </DrawerContent>
      </Drawer>
    </div>
  ) : null;

  return <>{typeof document !== 'undefined' && drawerOverlay ? createPortal(drawerOverlay, document.body) : null}</>;
};

export default FlightCtlPageDrawer;
