import * as React from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import FlightCtlModal from './FlightCtlModal';
import { NavigationGuardController } from './NavigationGuardController';

type NavigationGuardContextValue = {
  isLocked: boolean;
  isBlocked: boolean;
  tryNavigate: (run: () => void) => void;
  register: () => VoidFunction;
  proceed: VoidFunction;
  reset: () => void;
};

const noop = () => undefined;

const defaultValue: NavigationGuardContextValue = {
  isLocked: false,
  isBlocked: false,
  tryNavigate: (run) => run(),
  register: () => noop,
  proceed: noop,
  reset: noop,
};

const NavigationGuardContext = React.createContext<NavigationGuardContextValue>(defaultValue);

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

  const value = React.useMemo<NavigationGuardContextValue>(
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

export const useNavigationGuard = () => React.useContext(NavigationGuardContext);

/** Register a leave lock while `lock` is true (e.g. dirty Formik form). */
export const useRegisterNavigationLock = (lock: boolean) => {
  const { register } = useNavigationGuard();

  React.useEffect(() => {
    if (!lock) {
      return undefined;
    }
    return register();
  }, [lock, register]);
};
