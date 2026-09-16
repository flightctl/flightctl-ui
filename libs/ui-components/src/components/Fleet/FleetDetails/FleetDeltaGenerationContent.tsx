import * as React from 'react';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Icon,
  Label,
} from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import MinusCircleIcon from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import InProgressIcon from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { ConditionType, type DeltaGenerationStatus, type Fleet } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import LabelWithHelperText from '../../common/WithHelperText';
import { getCondition } from '../../../utils/api';
import DeltaGenerationHelpContent from '../CreateFleet/DeltaGenerationHelpContent';

const DeltaLabel = ({ icon, text }: { icon: React.ReactNode; text: string }) => {
  return (
    <Label
      style={{ '--pf-v6-c-label__content--Gap': 'var(--pf-t--global--spacer--sm)' } as React.CSSProperties}
      variant="outline"
      icon={icon}
    >
      {text}
    </Label>
  );
};

const getDeltaProgressStatus = (fleet: Fleet) => {
  const deltaPreparingCondition = getCondition(fleet.status?.conditions, ConditionType.FleetDeltaPreparing);
  if (!deltaPreparingCondition) {
    return null;
  }

  return fleet.status?.deltaGeneration || { completed: 0, total: 0 };
};

const FleetDeltaGenerationProgress = ({ deltaStatus }: { deltaStatus: DeltaGenerationStatus }) => {
  const { t } = useTranslation();

  if (deltaStatus.completed === 0 && deltaStatus.total === 0) {
    return t('Progress unknown');
  }

  const message = t('Completed {{ completed }} of {{ total }} artifacts', {
    completed: deltaStatus.completed,
    total: deltaStatus.total,
  });
  return <DeltaLabel icon={<InProgressIcon />} text={message} />;
};

const FleetDeltaGenerationContent = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();

  const isDeltaEnabled = fleet.spec.rolloutPolicy?.deltaGeneration?.generateDelta !== false;
  const deltaStatus = getDeltaProgressStatus(fleet);

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>
          <LabelWithHelperText label={t('Delta generation')} content={<DeltaGenerationHelpContent />} />
        </DescriptionListTerm>
        <DescriptionListDescription>
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsSm' }}
            alignItems={{ default: 'alignItemsFlexStart' }}
          >
            <FlexItem>
              {isDeltaEnabled ? (
                <DeltaLabel
                  text={t('Enabled')}
                  icon={
                    <Icon status="success">
                      <CheckCircleIcon />
                    </Icon>
                  }
                />
              ) : (
                <DeltaLabel text={t('Disabled')} icon={<MinusCircleIcon />} />
              )}
            </FlexItem>
            {deltaStatus && (
              <FlexItem>
                <FleetDeltaGenerationProgress deltaStatus={deltaStatus} />
              </FlexItem>
            )}
          </Flex>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};

export default FleetDeltaGenerationContent;
