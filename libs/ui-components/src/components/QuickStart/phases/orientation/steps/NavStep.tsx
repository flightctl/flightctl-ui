import * as React from 'react';

import { StepBody, StepHeader, StepHint } from '../../../guide/StepChrome';
import { useTranslation } from '../../../../../hooks/useTranslation';

const NavStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <StepHeader title={t('Navigate the console')} />
      <StepBody>
        {t(
          'The left sidebar is your primary navigation. Each section corresponds to a stage of the edge device lifecycle: Image builds for OS preparation, Devices for enrollment and monitoring, Fleets for group configuration, Software Catalog for application management, and Repositories for GitOps sources.',
        )}
      </StepBody>
      <StepHint>
        {t(
          "Sections visible to you depend on your permissions. If something isn't listed, your administrator controls access.",
        )}
      </StepHint>
    </>
  );
};

export default NavStep;
