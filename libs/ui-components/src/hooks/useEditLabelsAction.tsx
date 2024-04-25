import * as React from 'react';

import EditLabelsModal from '../components/modals/EditLabelsModal/EditLabelsModal';
import { FlightCtlLabel, LabelEditable } from '../types/extraTypes';
import { useTranslation } from './useTranslation';

type EditLabelsActionProps<T extends LabelEditable> = {
  resourceType: 'fleets' | 'devices';
  submitTransformer: (data: T, labels: FlightCtlLabel[]) => T;
  onEditSuccess: VoidFunction;
};

export function useEditLabelsAction<T extends LabelEditable>({
  resourceType,
  submitTransformer,
  onEditSuccess,
}: EditLabelsActionProps<T>) {
  const { t } = useTranslation();
  const [resourceName, setResourceName] = React.useState<string>();

  const editLabelsAction = ({
    resourceId,
    disabledReason,
  }: {
    resourceId: string;
    disabledReason?: string | boolean;
  }) => {
    const popperProps = disabledReason ? { tooltipProps: { content: disabledReason } } : undefined;
    return {
      title: t('Edit labels'),
      isAriaDisabled: !!disabledReason,
      ...popperProps,
      onClick: () => setResourceName(resourceId),
    };
  };
  const editLabelsModal = !!resourceName && (
    <EditLabelsModal
      resourceType={resourceType}
      resourceName={resourceName}
      submitTransformer={submitTransformer}
      onClose={(success?: boolean) => {
        setResourceName(undefined);
        if (success) {
          onEditSuccess();
        }
      }}
    />
  );

  return { editLabelsAction, editLabelsModal };
}
