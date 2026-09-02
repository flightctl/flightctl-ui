import * as React from 'react';
import type { QuickStartPhaseId } from './types';

const VIEWPORT_MARGIN = 8;

const clampPosition = (x: number, y: number, width: number, height: number) => {
  const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN);
  const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN);
  return {
    x: Math.min(Math.max(VIEWPORT_MARGIN, x), maxX),
    y: Math.min(Math.max(VIEWPORT_MARGIN, y), maxY),
  };
};

export const useQuickStartGuideDrag = (activePhaseId: QuickStartPhaseId | undefined) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const userPositionedRef = React.useRef(false);
  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  React.useEffect(() => {
    setPosition(null);
    setIsDragging(false);
    userPositionedRef.current = false;
    dragRef.current = null;
  }, [activePhaseId]);

  const getPanelPosition = React.useCallback(() => {
    if (position) {
      return position;
    }
    const panel = panelRef.current;
    if (!panel) {
      return { x: VIEWPORT_MARGIN, y: VIEWPORT_MARGIN };
    }
    const rect = panel.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }, [position]);

  const endDrag = React.useCallback((pointerId: number, moved: boolean) => {
    dragRef.current = null;
    setIsDragging(false);
    if (moved) {
      userPositionedRef.current = true;
    }
    panelRef.current?.releasePointerCapture(pointerId);
  }, []);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement;
      if (!target.closest('.fctl-quickstart-guide__drag-handle') || target.closest('button')) {
        return;
      }

      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const current = getPanelPosition();
      setPosition(current);
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: current.x,
        originY: current.y,
      };
      setIsDragging(true);
      panel.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    [getPanelPosition],
  );

  const handlePointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !panel) {
      return;
    }

    const next = clampPosition(
      drag.originX + event.clientX - drag.startX,
      drag.originY + event.clientY - drag.startY,
      panel.offsetWidth,
      panel.offsetHeight,
    );
    setPosition(next);
  }, []);

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      const moved = Math.abs(event.clientX - drag.startX) > 3 || Math.abs(event.clientY - drag.startY) > 3;
      endDrag(event.pointerId, moved);
    },
    [endDrag],
  );

  const handlePointerCancel = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      endDrag(event.pointerId, false);
    },
    [endDrag],
  );

  const panelStyle = React.useMemo<React.CSSProperties | undefined>(
    () =>
      position
        ? {
            top: position.y,
            left: position.x,
            right: 'auto',
            bottom: 'auto',
          }
        : undefined,
    [position],
  );

  return {
    panelRef,
    panelStyle,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
};
