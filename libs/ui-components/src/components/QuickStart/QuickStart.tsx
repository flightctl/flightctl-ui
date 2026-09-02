import * as React from 'react';
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

import type { QuickStartPhase } from './types';
import { useTranslation } from '../../hooks/useTranslation';
import { useQuickStart } from './QuickStartContext';

import './QuickStart.css';

const PHASE_ICONS: Record<string, React.ComponentType> = {
  home: HomeIcon,
  image: BuilderImageIcon,
  plus: PlusCircleIcon,
  cubes: CubesIcon,
};

interface PhaseCardProps {
  card: QuickStartPhase;
  isLocked: boolean;
  prevPhaseTitle: string | undefined;
}

const PhaseCard = ({ card, isLocked, prevPhaseTitle }: PhaseCardProps) => {
  const { t } = useTranslation();
  const { startPhase } = useQuickStart();
  const PhaseIcon = PHASE_ICONS[card.icon] || HomeIcon;

  return (
    <Card
      id={`quickstart-phase-${card.id}`}
      isFullHeight
      style={isLocked ? { opacity: 0.65, width: '100%' } : { width: '100%' }}
    >
      <CardBody
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Stack hasGutter style={{ flex: 1 }}>
          <StackItem>
            <Icon
              size="xl"
              style={
                {
                  '--pf-v6-c-icon__content--Color': isLocked
                    ? 'var(--pf-t--global--icon--color--disabled)'
                    : 'var(--pf-t--global--icon--color--brand--default)',
                } as React.CSSProperties
              }
            >
              <PhaseIcon />
            </Icon>
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.h3} className="pf-v6-u-mb-0">
              {card.title}
            </Content>
          </StackItem>
          <StackItem>
            <LabelGroup>
              <Label isCompact icon={<OutlinedClockIcon />}>
                {t('{{count}} minutes', { count: 3 })}
              </Label>
              <Label isCompact color="blue">
                {t('{{count}} tasks', { count: 1 })}
              </Label>
              {isLocked && (
                <Label isCompact color="grey" icon={<LockIcon />}>
                  {t('Locked')}
                </Label>
              )}
            </LabelGroup>
          </StackItem>
          <StackItem>
            <Content component={ContentVariants.p} className="pf-v6-u-color-200 pf-v6-u-mb-0">
              {card.description}
            </Content>
          </StackItem>
        </Stack>
        <div style={{ marginTop: 'auto', paddingTop: 'var(--pf-t--global--spacer--md, 16px)' }}>
          {isLocked ? (
            <Popover
              headerContent={t('Prerequisites')}
              bodyContent={
                <ul className="pf-v6-u-mb-0">
                  <li>{t('Complete "{{prevPhaseTitle}}"', { prevPhaseTitle })}</li>
                </ul>
              }
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
              {t('Start')}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

const QuickStartToggleAction = ({ onToggle, compact = false }: { onToggle: () => void; compact?: boolean }) => {
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
  const { panelVisibility, phases, toggleVisibility, toggleCollapsed } = useQuickStart();

  if (panelVisibility === 'hidden') {
    return null;
  }

  const totalPhases = phases.length;

  if (panelVisibility === 'collapsed') {
    return (
      <Card className="fctl-quickstart-card">
        <CardBody>
          <Split hasGutter>
            <SplitItem isFilled>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
                <FlexItem>
                  <Content component="p" className="pf-v6-u-font-weight-bold">
                    {t('Quick start guide')}
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Content component={ContentVariants.small}>
                    {t('{{completed}}/{{total}} phases complete', {
                      completed: 0,
                      total: totalPhases,
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

  return (
    <Card className="fctl-quickstart-card fctl-quickstart-card__expanded">
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
              <Content component={ContentVariants.h2}>{t('Quick start guide')}</Content>
            </StackItem>
            <StackItem>
              <Content component="p" className="pf-v6-u-color-200">
                {t('Follow these phases to get your edge management environment up and running.')}
              </Content>
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
                  value={0}
                  title={t('Progress')}
                  measureLocation="outside"
                  label={t('{{completed}} of {{total}}', { completed: 0, total: totalPhases })}
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
                    <Content component={ContentVariants.small} className="pf-v6-u-color-200">
                      {t('~{{count}} minutes', { count: 44 })}
                    </Content>
                  </FlexItem>
                </Flex>
              </SplitItem>
            </Split>
          </StackItem>
          <StackItem>
            <Grid hasGutter>
              {phases.map((phase, index) => (
                <GridItem key={phase.id} md={6} lg={3} style={{ display: 'flex' }}>
                  <PhaseCard
                    card={phase}
                    isLocked={index > 0}
                    prevPhaseTitle={index === 0 ? undefined : phases[index - 1].title}
                  />
                </GridItem>
              ))}
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
