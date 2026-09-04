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
import EyeIcon from '@patternfly/react-icons/dist/js/icons/eye-icon';

import { useTranslation } from '../../hooks/useTranslation';
import { useQuickStartGuide } from './QuickStartContext';
import { useQuickStartGuideDrag } from './useQuickStartGuideDrag';

import './QuickStartGuide.css';

const StepChipCounter = ({ className }: { className?: string }) => {
  return (
    <Label isCompact color="blue" className={className || ''}>
      1 / 4
    </Label>
  );
};

interface GuideWindowActionsProps {
  variant: 'expanded' | 'minimized';
  onExpand: VoidFunction;
  onClose: VoidFunction;
  onMinimize: VoidFunction;
}

const GuideWindowActions = ({ variant, onExpand, onClose, onMinimize }: GuideWindowActionsProps) => {
  const { t } = useTranslation();

  const closeButton = (
    <Button variant="plain" size="sm" icon={<TimesIcon />} aria-label={t('Close guide')} onClick={onClose} />
  );

  if (variant === 'minimized') {
    return (
      <>
        <FlexItem>
          <Button
            variant="plain"
            size="sm"
            icon={<OutlinedWindowRestoreIcon />}
            aria-label={t('Expand guide')}
            onClick={onExpand}
          />
        </FlexItem>
        <FlexItem>{closeButton}</FlexItem>
      </>
    );
  }

  return (
    <>
      <Button
        variant="plain"
        size="sm"
        icon={<WindowMinimizeIcon />}
        aria-label={t('Minimize guide')}
        onClick={onMinimize}
      />
      {closeButton}
    </>
  );
};

const QuickStartGuideStepContent = () => {
  const { t } = useTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Split hasGutter>
          <SplitItem isFilled>
            <Content component="p" className="pf-v6-u-font-weight-bold">
              {t('Explore the console')}
            </Content>
          </SplitItem>
          <SplitItem>
            <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
              <Label color="orange" icon={<EyeIcon />} isCompact>
                {t('Orientation')}
              </Label>
            </Flex>
          </SplitItem>
        </Split>
      </StackItem>

      <StackItem>
        <Content component="p">{t('Some description here.')}</Content>
      </StackItem>

      <StackItem>
        <Content component={ContentVariants.small} className="pf-v6-u-color-200">
          {t('Sections visible to you depend on your permissions.')}
        </Content>
      </StackItem>
    </Stack>
  );
};

const QuickStartGuide = () => {
  const { t } = useTranslation();
  const { activePhase, isGuideMinimized, cancelPhase, setGuideMinimized } = useQuickStartGuide();

  const {
    panelRef,
    panelStyle,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useQuickStartGuideDrag(activePhase?.id);

  if (!activePhase) {
    return null;
  }

  const onExpandGuide = () => setGuideMinimized(false);
  const onMinimizeGuide = () => setGuideMinimized(true);

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
                <Button variant="link" isInline className="fctl-quickstart-guide__restore" onClick={onExpandGuide}>
                  <Content component={ContentVariants.small} className="pf-v6-u-font-weight-bold">
                    {activePhase.title}
                  </Content>
                  <StepChipCounter className="fctl-quickstart-guide__minimized-step" />
                  <Content component={ContentVariants.small} className="fctl-quickstart-guide__minimized-title">
                    {t('Explore the console')}
                  </Content>
                </Button>
              </FlexItem>
              <GuideWindowActions
                variant="minimized"
                onExpand={onExpandGuide}
                onMinimize={onMinimizeGuide}
                onClose={cancelPhase}
              />
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
                <GuideWindowActions
                  variant="expanded"
                  onExpand={onExpandGuide}
                  onClose={cancelPhase}
                  onMinimize={onMinimizeGuide}
                />
              ),
              hasNoOffset: true,
            }}
          >
            <CardTitle>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <Content component={ContentVariants.small}>{activePhase.title}</Content>
                </FlexItem>
                <FlexItem>
                  <StepChipCounter />
                </FlexItem>
              </Flex>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <QuickStartGuideStepContent />
          </CardBody>
          <CardFooter>
            <Split hasGutter>
              <SplitItem>
                <Button variant="secondary" size="sm" icon={<ArrowLeftIcon />} isDisabled>
                  {t('Back')}
                </Button>
              </SplitItem>
              <SplitItem isFilled />
              <SplitItem>
                <Button variant="primary" size="sm" icon={<ArrowRightIcon />} iconPosition="end" isDisabled>
                  {t('Next')}
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

export default QuickStartGuide;
