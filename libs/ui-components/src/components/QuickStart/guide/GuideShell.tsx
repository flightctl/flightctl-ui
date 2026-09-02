import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Label,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/js/icons/times-icon';
import WindowMinimizeIcon from '@patternfly/react-icons/dist/js/icons/window-minimize-icon';
import OutlinedWindowRestoreIcon from '@patternfly/react-icons/dist/js/icons/outlined-window-restore-icon';
import ArrowRightIcon from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';
import ArrowLeftIcon from '@patternfly/react-icons/dist/js/icons/arrow-left-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { useQuickStartGuide } from '../QuickStartContext';
import { getPhaseTitle } from '../quickStartDefinitions';
import { useQuickStartGuideDrag } from '../useQuickStartGuideDrag';

import '../QuickStartGuide.css';

interface StepChipCounterProps {
  current: number;
  total: number;
  className?: string;
}

const StepChipCounter = ({ current, total, className }: StepChipCounterProps) => (
  <Label isCompact color="blue" className={className || ''}>
    {current} / {total}
  </Label>
);

interface GuideWindowActionsProps {
  variant: 'expanded' | 'minimized';
  onToggle: VoidFunction;
  onClose: VoidFunction;
}

const GuideWindowActions = ({ variant, onToggle, onClose }: GuideWindowActionsProps) => {
  const { t } = useTranslation();
  const isMinimized = variant === 'minimized';
  return (
    <>
      <FlexItem>
        <Button
          variant="plain"
          size="sm"
          icon={isMinimized ? <OutlinedWindowRestoreIcon /> : <WindowMinimizeIcon />}
          aria-label={isMinimized ? t('Expand guide') : t('Minimize guide')}
          onClick={onToggle}
        />
      </FlexItem>
      <FlexItem>
        <Button variant="plain" size="sm" icon={<TimesIcon />} aria-label={t('Close guide')} onClick={onClose} />
      </FlexItem>
    </>
  );
};

export interface GuideShellProps {
  children: React.ReactNode;
}

export const GuideShell = ({ children }: GuideShellProps) => {
  const { t } = useTranslation();
  const {
    activePhaseId,
    activeStepIndex,
    guidePresentation,
    guideActions,
    isGuideMinimized,
    setGuideMinimized,
    cancelPhase,
  } = useQuickStartGuide();

  const {
    panelRef,
    panelStyle,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useQuickStartGuideDrag(activePhaseId ?? undefined);

  if (!activePhaseId) {
    throw new Error('GuideShell requires an active guide');
  }

  const { stepTitle, totalSteps, canGoBack, canGoNext, isLastStep, footerExtra } = guidePresentation;
  const phaseTitle = getPhaseTitle(t, activePhaseId);
  const onBack = guideActions?.onBack;
  const onNext = guideActions?.onNext;

  const panelClassName = [
    'fctl-quickstart-guide',
    isGuideMinimized ? 'fctl-quickstart-guide--minimized' : '',
    isDragging ? 'fctl-quickstart-guide--dragging' : '',
    panelStyle ? 'fctl-quickstart-guide--positioned' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return ReactDOM.createPortal(
    <div
      ref={panelRef}
      className={panelClassName}
      style={panelStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {isGuideMinimized ? (
        <Card isCompact>
          <CardBody className="fctl-quickstart-guide__drag-handle" aria-label={t('Drag guide')}>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem flex={{ default: 'flex_1' }}>
                <Button
                  variant="link"
                  isInline
                  className="fctl-quickstart-guide__restore"
                  onClick={() => setGuideMinimized(false)}
                >
                  <Content component={ContentVariants.small} className="pf-v6-u-font-weight-bold">
                    {phaseTitle}
                  </Content>
                  <StepChipCounter
                    current={activeStepIndex + 1}
                    total={totalSteps}
                    className="fctl-quickstart-guide__minimized-step"
                  />
                  {stepTitle ? (
                    <Content component={ContentVariants.small} className="fctl-quickstart-guide__minimized-title">
                      {stepTitle}
                    </Content>
                  ) : null}
                </Button>
              </FlexItem>
              <GuideWindowActions variant="minimized" onToggle={() => setGuideMinimized(false)} onClose={cancelPhase} />
            </Flex>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            className="fctl-quickstart-guide__drag-handle"
            aria-label={t('Drag guide')}
            actions={{
              actions: (
                <GuideWindowActions variant="expanded" onToggle={() => setGuideMinimized(true)} onClose={cancelPhase} />
              ),
              hasNoOffset: true,
            }}
          >
            <CardTitle>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <Content component={ContentVariants.small}>{phaseTitle}</Content>
                </FlexItem>
                <FlexItem>
                  <StepChipCounter current={activeStepIndex + 1} total={totalSteps} />
                </FlexItem>
              </Flex>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Stack hasGutter>
              <StackItem>{children}</StackItem>
            </Stack>
          </CardBody>
          <CardFooter>
            <Split hasGutter>
              <SplitItem>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ArrowLeftIcon />}
                  isDisabled={!canGoBack || !onBack}
                  onClick={onBack}
                >
                  {t('Back')}
                </Button>
              </SplitItem>
              <SplitItem isFilled />
              {footerExtra ? <SplitItem>{footerExtra}</SplitItem> : null}
              <SplitItem>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ArrowRightIcon />}
                  iconPosition="end"
                  isDisabled={!canGoNext || !onNext}
                  onClick={onNext}
                >
                  {isLastStep ? t('Complete') : t('Next')}
                </Button>
              </SplitItem>
            </Split>
          </CardFooter>
        </Card>
      )}
    </div>,
    document.body,
  );
};
