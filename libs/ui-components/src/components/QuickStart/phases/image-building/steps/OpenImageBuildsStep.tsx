import * as React from 'react';
import { type TFunction } from 'react-i18next';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const viewerOrientation = (t: TFunction) =>
  t(
    'The Image builds page tracks OS image builds across your organization. Your administrator or image builder creates and manages images here.',
  );

const adminView = (t: TFunction) =>
  t(
    'This is the Image builds page. Here you will see image builds and their status in the list. From here you can open a build to review its configuration and progress.',
  );

type OpenImageBuildsStepProps = {
  canCreateBuild: boolean;
  hasBuilds?: boolean;
  isOnBuildsPage?: boolean;
};

const StepHintContent = ({ isOnBuildsPage, hasBuilds, canCreateBuild }: OpenImageBuildsStepProps) => {
  const { t } = useTranslation();

  if (!isOnBuildsPage) {
    return <StepHint>{t('Open Image builds in the left sidebar, then continue here.')}</StepHint>;
  }
  if (hasBuilds) {
    return <StepHint>{t('Browse the builds in the table behind this guide')}</StepHint>;
  }
  if (canCreateBuild) {
    return <StepHint>{t('Create your first build to get started')}</StepHint>;
  }
  return null;
};

const StepBodyContent = ({ canCreateBuild }: OpenImageBuildsStepProps) => {
  const { t } = useTranslation();

  if (!canCreateBuild) {
    return <StepBody>{viewerOrientation(t)}</StepBody>;
  }

  return <StepBody>{adminView(t)}</StepBody>;
};

const OpenImageBuildsStep = ({ canCreateBuild, isOnBuildsPage, hasBuilds }: OpenImageBuildsStepProps) => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Navigate to Image builds')} />

      <StepBodyContent canCreateBuild={canCreateBuild} />

      <StepHintContent canCreateBuild={canCreateBuild} isOnBuildsPage={isOnBuildsPage} hasBuilds={hasBuilds} />
    </>
  );
};

export default OpenImageBuildsStep;
