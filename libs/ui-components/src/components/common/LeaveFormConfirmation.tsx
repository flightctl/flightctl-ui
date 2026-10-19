import { useFormikContext } from 'formik';

import { useRegisterNavigationLock } from './NavigationGuard';

const LeaveFormConfirmation = () => {
  const { dirty, isSubmitting } = useFormikContext();
  const lock = !isSubmitting && dirty;

  useRegisterNavigationLock(lock);

  return null;
};

export default LeaveFormConfirmation;
