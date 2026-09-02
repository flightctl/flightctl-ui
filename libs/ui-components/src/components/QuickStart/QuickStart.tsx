import * as React from 'react';
import type { TFunction } from 'i18next';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Label,
  LabelGroup,
  Popover,
  Progress,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import WindowMinimizeIcon from '@patternfly/react-icons/dist/js/icons/window-minimize-icon';
import OutlinedWindowRestoreIcon from '@patternfly/react-icons/dist/js/icons/outlined-window-restore-icon';
import OutlinedClockIcon from '@patternfly/react-icons/dist/js/icons/outlined-clock-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';
import HomeIcon from '@patternfly/react-icons/dist/js/icons/home-icon';
import BuilderImageIcon from '@patternfly/react-icons/dist/js/icons/builder-image-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import CubesIcon from '@patternfly/react-icons/dist/js/icons/cubes-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';

import type { PhaseCardStatus, QuickStartPhase, QuickStartPhaseIcon, QuickStartPhaseId } from './types';
import { useTranslation } from '../../hooks/useTranslation';
import { useProductName } from '../../hooks/useProductName';
import { usePermissionsContext } from '../common/PermissionsContext';
import { useQuickStart } from './QuickStartContext';
import { getPhaseDescription, getPhaseTitle } from './quickStartDefinitions';

import './QuickStart.css';

const PHASE_ICONS: Record<QuickStartPhaseIcon, React.ComponentType> = {
  home: HomeIcon,
  image: BuilderImageIcon,
  plus: PlusCircleIcon,
  cubes: CubesIcon,
};

interface PhaseCardProps {
  card: QuickStartPhase;
  prevPhaseId?: QuickStartPhaseId;
}

const getActionLabel = (t: TFunction, status: PhaseCardStatus) => {
  switch (status) {
    case 'complete':
      return t('Restart');
    case 'in-progress':
      return t('Continue');
    default:
      return t('Start');
  }
};

const CardStatusLabel = ({ status }: { status: PhaseCardStatus }) => {
  const { t } = useTranslation();

  switch (status) {
    case 'complete':
      return (
        <Label isCompact color="green" icon={<CheckCircleIcon />}>
          {t('Complete')}
        </Label>
      );
    case 'in-progress':
      return (
        <Label isCompact color="blue">
          {t('In progress')}
        </Label>
      );
    case 'locked':
      return (
        <Label isCompact color="grey" icon={<LockIcon />}>
          {t('Locked')}
        </Label>
      );
    default:
      return null;
  }
};

const PhaseCard = ({ card, prevPhaseId }: PhaseCardProps) => {
  const { t } = useTranslation();
  const { startPhase } = useQuickStart();
  const { checkPermissions } = usePermissionsContext();
  const PhaseIcon = PHASE_ICONS[card.icon];

  const isLocked = card.status === 'locked';
  const actionLabel = getActionLabel(t, card.status);
  const productName = useProductName();

  let lockedByPhase: string | undefined;
  if (isLocked) {
    lockedByPhase = prevPhaseId ? getPhaseTitle(t, prevPhaseId) : undefined;
  }

  return (
    <Card
      id={`quickstart-phase-${card.id}`}
      className={`fctl-quickstart-phase ${isLocked ? 'fctl-quickstart-phase--locked' : ''}`}
      isFullHeight
    >
      <CardBody>
        <Stack hasGutter>
          <StackItem className="fctl-quickstart-phase__icon">
            <Icon size="xl">
              <PhaseIcon />
            </Icon>
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.h3}>{getPhaseTitle(t, card.id)}</Content>
          </StackItem>
          <StackItem>
            <LabelGroup>
              <Label isCompact icon={<OutlinedClockIcon />}>
                {t('{{count}} minutes', { count: card.estimatedMinutes })}
              </Label>
              {card.stepCount > 0 && (
                <Label isCompact color="blue">
                  {t('{{count}} tasks', { count: card.stepCount })}
                </Label>
              )}
              <CardStatusLabel status={card.status} />
            </LabelGroup>
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.p}>
              {getPhaseDescription(t, card.id, productName, checkPermissions)}
            </Content>
          </StackItem>
          <StackItem style={{ marginTop: 'auto' }}>
            {lockedByPhase ? (
              <Popover
                headerContent={t('Prerequisites')}
                bodyContent={t('Complete "{{prevPhaseTitle}}"', { prevPhaseTitle: lockedByPhase })}
                triggerAction="hover"
              >
                <Button
                  variant="link"
                  isInline
                  icon={<InfoCircleIcon />}
                  iconPosition="end"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {t('Prerequisites (1)')}
                </Button>
              </Popover>
            ) : (
              <Button variant="primary" onClick={() => startPhase(card.id)}>
                {actionLabel}
              </Button>
            )}
          </StackItem>
        </Stack>
      </CardBody>
    </Card>
  );
};

const QuickStartToggleAction = ({ onToggle, compact = false }: { onToggle: VoidFunction; compact?: boolean }) => {
  const { t } = useTranslation();

  return (
    <Tooltip content={t('To show it again, open Settings in the toolbar above and choose Show quick start guide.')}>
      <Button variant="link" size={compact ? 'sm' : undefined} isInline={compact} onClick={onToggle}>
        {t('Hide quick start guide')}
      </Button>
    </Tooltip>
  );
};

const QuickStart = () => {
  const { t } = useTranslation();
  const { panelVisibility, phases, totalPhaseCount, totalMinutes, toggleVisibility, toggleCollapsed } = useQuickStart();

  if (panelVisibility === 'hidden') {
    return null;
  }

  const heading = t('Quick start guide');
  const subtitle = t('Follow these phases to get your edge management environment up and running.');
  const completedPhaseCount = phases.filter((phase) => phase.status === 'complete').length;

  if (panelVisibility === 'collapsed') {
    return (
      <Card className="fctl-quickstart-panel">
        <CardBody>
          <Split hasGutter>
            <SplitItem isFilled>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
                <FlexItem>
                  <Content component="p" className="pf-v6-u-font-weight-bold">
                    {heading}
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Content component={ContentVariants.small}>
                    {t('{{completed}}/{{total}} phases complete', {
                      completed: completedPhaseCount,
                      total: totalPhaseCount,
                    })}
                  </Content>
                </FlexItem>
              </Flex>
            </SplitItem>
            <SplitItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
                <FlexItem>
                  <QuickStartToggleAction onToggle={toggleVisibility} compact />
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="plain"
                    size="sm"
                    icon={<OutlinedWindowRestoreIcon />}
                    aria-label={t('Expand guide')}
                    onClick={toggleCollapsed}
                  />
                </FlexItem>
              </Flex>
            </SplitItem>
          </Split>
        </CardBody>
      </Card>
    );
  }

  const progressValue = totalPhaseCount > 0 ? Math.round((completedPhaseCount / totalPhaseCount) * 100) : 0;

  return (
    <Card className="fctl-quickstart-panel fctl-quickstart-panel__expanded">
      <CardHeader
        actions={{
          actions: (
            <Button
              variant="plain"
              size="sm"
              icon={<WindowMinimizeIcon />}
              aria-label={t('Collapse guide')}
              onClick={toggleCollapsed}
            />
          ),
          hasNoOffset: true,
        }}
      >
        <CardTitle>
          <Stack>
            <StackItem>
              <Content component={ContentVariants.h2}>{heading}</Content>
            </StackItem>
            <StackItem>
              <Content component="p">{subtitle}</Content>
            </StackItem>
          </Stack>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Split hasGutter>
              <SplitItem isFilled>
                <Progress
                  value={progressValue}
                  title={t('Progress')}
                  measureLocation="outside"
                  label={t('{{completed}} of {{total}}', {
                    completed: completedPhaseCount,
                    total: totalPhaseCount,
                  })}
                />
              </SplitItem>
              <SplitItem>
                <Flex alignItems={{ default: 'alignItemsFlexEnd' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Icon size="sm">
                      <OutlinedClockIcon />
                    </Icon>
                  </FlexItem>
                  <FlexItem>
                    <Content component={ContentVariants.small}>
                      {t('~{{count}} minutes', { count: totalMinutes })}
                    </Content>
                  </FlexItem>
                </Flex>
              </SplitItem>
            </Split>
          </StackItem>
          <StackItem>
            <Grid hasGutter>
              {phases.map((phase, index) => {
                const prevPhaseId = index === 0 ? undefined : phases[index - 1]?.id;
                return (
                  <GridItem key={phase.id} md={6} lg={3} style={{ display: 'flex' }}>
                    <PhaseCard card={phase} prevPhaseId={prevPhaseId} />
                  </GridItem>
                );
              })}
            </Grid>
          </StackItem>
          <StackItem>
            <Split hasGutter>
              <SplitItem isFilled />
              <SplitItem>
                <QuickStartToggleAction onToggle={toggleVisibility} />
              </SplitItem>
            </Split>
          </StackItem>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default QuickStart;
