import * as React from 'react';

import EditLabelsModal from '@app/components/modals/EditLabelsModal/EditLabelsModal';
import { FlightCtlLabel, LabelEditable } from '@app/types/extraTypes';

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
      title: 'Edit labels',
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
