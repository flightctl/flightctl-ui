import * as React from 'react';

import { StepBody, StepHeader, StepItemList } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

export type ImageBuildViewerUserCapabilitiesPermissions = {
  canListBuilds: boolean;
  canViewBuild: boolean;
  canViewLogs: boolean;
  canDownloadExport: boolean;
};

const ViewerUserCapabilitiesStep = ({
  canListBuilds,
  canViewBuild,
  canViewLogs,
  canDownloadExport,
}: ImageBuildViewerUserCapabilitiesPermissions) => {
  const { t } = useTranslation();

  const capabilities: string[] = [];
  if (canListBuilds) {
    capabilities.push(t('See image builds and their status in the list'));
  }
  if (canViewBuild) {
    capabilities.push(t('Open a build to review its configuration and progress'));
  }
  if (canViewLogs) {
    capabilities.push(t('Review build logs when troubleshooting'));
  }
  if (canDownloadExport) {
    capabilities.push(t('Download exported disk images when they are available'));
  }

  return (
    <>
      <StepHeader title={t('What you can do on Image builds')} />
      {capabilities.length > 0 ? (
        <StepItemList title={t('From the Image builds area you can')} items={capabilities} />
      ) : (
        <StepBody>{t('The Image builds area is where your organization prepares custom edge OS images.')}</StepBody>
      )}
      <StepBody>
        {t('New images are created through a build wizard managed by your administrator or image builder.')}
      </StepBody>
    </>
  );
};

export default ViewerUserCapabilitiesStep;
