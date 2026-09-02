import * as React from 'react';

import { QuickStartProvider, useQuickStartGuide } from './QuickStartContext';

const QuickStartGuideLoader = React.lazy(() => import('./QuickStartGuide'));

const QuickStartGuideGate = () => {
  const { activePhase } = useQuickStartGuide();

  if (!activePhase) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <QuickStartGuideLoader />
    </React.Suspense>
  );
};

interface QuickStartHostProps {
  children: React.ReactNode;
}

const QuickStartHost = ({ children }: QuickStartHostProps) => {
  return (
    <QuickStartProvider>
      {children}
      <QuickStartGuideGate />
    </QuickStartProvider>
  );
};

export default QuickStartHost;
