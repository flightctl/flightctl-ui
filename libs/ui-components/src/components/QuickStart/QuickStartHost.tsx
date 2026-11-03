import * as React from 'react';

import { useAppContext } from '../../hooks/useAppContext';
import { QuickStartProvider, useQuickStart } from './QuickStartContext';

const QuickStartGuideLoader = React.lazy(() => import('./QuickStartGuide'));

const QuickStartGuideGate = () => {
  const { activePhaseId } = useQuickStart();

  if (!activePhaseId) {
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
  const { user = '' } = useAppContext();

  return (
    <QuickStartProvider key={user} username={user}>
      {children}
      <QuickStartGuideGate />
    </QuickStartProvider>
  );
};

export default QuickStartHost;
