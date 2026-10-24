import * as React from 'react';

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

export const NavigationGuardContext = React.createContext<NavigationGuardContextValue>(defaultValue);

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
