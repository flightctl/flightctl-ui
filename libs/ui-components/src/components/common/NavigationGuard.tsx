import * as React from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import FlightCtlModal from './FlightCtlModal';
import { NavigationGuardContext } from './NavigationGuardContext';
import { NavigationGuardController } from './NavigationGuardController';

export { useNavigationGuard, useRegisterNavigationLock } from './NavigationGuardContext';

const ConfirmNavigationDialog = ({ onProceed, onReset }: { onProceed: VoidFunction; onReset: VoidFunction }) => {
  const { t } = useTranslation();
  return (
    <FlightCtlModal isOpen variant="small">
      <ModalHeader title={t('There are unsaved changes')} titleIconVariant="warning" />
      <ModalBody>{t('Are you sure you want to leave the current page? Unsaved changes will be lost.')}</ModalBody>
      <ModalFooter>
        <Button key="proceed" variant="danger" onClick={onProceed}>
          {t('Discard changes')}
        </Button>
        <Button key="stay" variant="link" onClick={onReset}>
          {t('Stay here')}
        </Button>
      </ModalFooter>
    </FlightCtlModal>
  );
};

export const NavigationGuardProvider = ({ children }: React.PropsWithChildren) => {
  const controllerRef = React.useRef<NavigationGuardController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = new NavigationGuardController();
  }
  const controller = controllerRef.current;

  const [isLocked, setIsLocked] = React.useState(controller.isLocked);
  const [isBlocked, setIsBlocked] = React.useState(controller.isBlocked);

  React.useEffect(() => {
    return controller.subscribe(() => {
      setIsLocked(controller.isLocked);
      setIsBlocked(controller.isBlocked);
    });
  }, [controller]);

  React.useEffect(() => {
    if (!isLocked) {
      return undefined;
    }
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isLocked]);

  // Keep these stable. Recreating `register` when isBlocked/isLocked changes re-runs
  // useRegisterNavigationLock's effect, which unregisters (clearing pending) and hides the dialog.
  const tryNavigate = React.useCallback((run: () => void) => controller.tryNavigate(run), [controller]);
  const register = React.useCallback(() => controller.register(), [controller]);
  const proceed = React.useCallback(() => controller.proceed(), [controller]);
  const reset = React.useCallback(() => controller.reset(), [controller]);

  const value = React.useMemo(
    () => ({
      isLocked,
      isBlocked,
      tryNavigate,
      register,
      proceed,
      reset,
    }),
    [isBlocked, isLocked, proceed, register, reset, tryNavigate],
  );

  return (
    <NavigationGuardContext.Provider value={value}>
      {children}
      {isBlocked && <ConfirmNavigationDialog onProceed={proceed} onReset={reset} />}
    </NavigationGuardContext.Provider>
  );
};
