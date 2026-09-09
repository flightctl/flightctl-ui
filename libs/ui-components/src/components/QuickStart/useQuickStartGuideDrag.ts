import * as React from 'react';
import type { QuickStartPhaseId } from './types';

const VIEWPORT_MARGIN = 8;
const DRAG_THRESHOLD_PX = 3;

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
  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    hasMoved: boolean;
  } | null>(null);

  React.useEffect(() => {
    setPosition(null);
    setIsDragging(false);
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

  const endDrag = React.useCallback((pointerId: number) => {
    dragRef.current = null;
    setIsDragging(false);
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
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: current.x,
        originY: current.y,
        hasMoved: false,
      };
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

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.hasMoved) {
      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
        return;
      }
      drag.hasMoved = true;
      setIsDragging(true);
    }

    const next = clampPosition(drag.originX + deltaX, drag.originY + deltaY, panel.offsetWidth, panel.offsetHeight);
    setPosition(next);
  }, []);

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      endDrag(event.pointerId);
    },
    [endDrag],
  );

  const handlePointerCancel = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      endDrag(event.pointerId);
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
