import * as React from 'react';

import { StepHeader, StepHint, StepItemList } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

type FindBuildActionsStepProps = {
  canViewBuild: boolean;
  canDeleteBuild: boolean;
  canCancelBuild: boolean;
  canCreateNewVersion: boolean;
  canAddToCatalog: boolean;
};

const FindBuildActionsStep = ({
  canViewBuild,
  canDeleteBuild,
  canCancelBuild,
  canCreateNewVersion,
  canAddToCatalog,
}: FindBuildActionsStepProps) => {
  const { t } = useTranslation();

  const actions = [];
  if (canViewBuild) {
    actions.push(t('View details'));
  }
  if (canCreateNewVersion) {
    actions.push(t('Create a new version (Rebuild)'));
  }
  if (canAddToCatalog) {
    actions.push(t('Add to catalog'));
  }
  if (canDeleteBuild) {
    actions.push(t('Delete'));
  }
  if (canCancelBuild) {
    actions.push(t('Cancel'));
  }

  return (
    <>
      <StepHeader title={t('Open build row actions')} />
      <StepItemList
        title={t('Open the kebab menu at the end of the image build row to see actions you can do')}
        items={actions}
      />
      {canViewBuild && <StepHint>{t('You can perform the same actions via the build detail page as well.')}</StepHint>}
    </>
  );
};

export default FindBuildActionsStep;
