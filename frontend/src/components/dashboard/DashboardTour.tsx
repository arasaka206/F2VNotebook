import React, { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardTourStep {
  id: string;
  title: string;
  description: string;
  targetRef: React.RefObject<HTMLElement | null>;
  page?: string;
}

interface DashboardTourProps {
  isOpen: boolean;
  activePage?: string;
  steps: DashboardTourStep[];
  initialStepId?: string;
  onNavigatePage?: (page: string) => void;
  onFinish: () => void;
  onSkip: () => void;
}

const OVERLAY_PADDING = 12;
const TOOLTIP_GAP = 18;
const HIGHLIGHT_PADDING = 10;

const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const DashboardTour: React.FC<DashboardTourProps> = ({
  isOpen,
  activePage,
  steps,
  initialStepId,
  onNavigatePage,
  onFinish,
  onSkip,
}) => {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [manualPosition, setManualPosition] = useState<{ left: number; top: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);

  const syncTargetRect = useEffectEvent(() => {
    if (!isOpen) {
      return;
    }

    const targetNode = steps[currentStepIndex]?.targetRef.current;
    setTargetRect(targetNode ? targetNode.getBoundingClientRect() : null);
  });

  useEffect(() => {
    if (isOpen) {
      const requestedStepIndex = steps.findIndex((step) => step.id === initialStepId);
      setCurrentStepIndex(requestedStepIndex >= 0 ? requestedStepIndex : 0);
      setManualPosition(null);
    }
  }, [initialStepId, isOpen]);

  useEffect(() => {
    setManualPosition(null);
  }, [currentStepIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const targetPage = steps[currentStepIndex]?.page;
    if (targetPage && activePage !== targetPage) {
      onNavigatePage?.(targetPage);
    }
  }, [activePage, currentStepIndex, isOpen, onNavigatePage, steps]);

  useEffect(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }

    const activeStep = steps[currentStepIndex];
    if (activeStep?.page && activePage !== activeStep.page) {
      setTargetRect(null);
      return;
    }

    const targetNode = steps[currentStepIndex]?.targetRef.current;
    if (!targetNode) {
      syncTargetRect();
      return;
    }

    targetNode.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    const timeoutId = window.setTimeout(() => {
      syncTargetRect();
    }, 260);

    return () => window.clearTimeout(timeoutId);
  }, [activePage, currentStepIndex, isOpen, steps]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleViewportChange = () => {
      syncTargetRect();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onSkip();
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrentStepIndex((previousIndex) => Math.min(previousIndex + 1, steps.length - 1));
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentStepIndex((previousIndex) => Math.max(previousIndex - 1, 0));
      }
    };

    syncTargetRect();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onSkip, steps.length]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setTooltipStyle({});
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = Math.min(360, viewportWidth - OVERLAY_PADDING * 2);
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 240;

    if (manualPosition) {
      setTooltipStyle({
        left: clampValue(
          manualPosition.left,
          OVERLAY_PADDING,
          Math.max(OVERLAY_PADDING, viewportWidth - tooltipWidth - OVERLAY_PADDING),
        ),
        top: clampValue(
          manualPosition.top,
          OVERLAY_PADDING,
          Math.max(OVERLAY_PADDING, viewportHeight - tooltipHeight - OVERLAY_PADDING),
        ),
        width: tooltipWidth,
      });
      return;
    }

    if (!targetRect) {
      setTooltipStyle({
        left: OVERLAY_PADDING,
        top: Math.max(OVERLAY_PADDING, viewportHeight - tooltipHeight - OVERLAY_PADDING),
        width: tooltipWidth,
      });
      return;
    }

    const centeredLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    const left = Math.min(
      Math.max(OVERLAY_PADDING, centeredLeft),
      Math.max(OVERLAY_PADDING, viewportWidth - tooltipWidth - OVERLAY_PADDING),
    );

    const fitsBelow = targetRect.bottom + TOOLTIP_GAP + tooltipHeight <= viewportHeight - OVERLAY_PADDING;
    const top = fitsBelow
      ? targetRect.bottom + TOOLTIP_GAP
      : Math.max(OVERLAY_PADDING, targetRect.top - tooltipHeight - TOOLTIP_GAP);

    setTooltipStyle({
      left,
      top,
      width: tooltipWidth,
    });
  }, [currentStepIndex, isOpen, manualPosition, targetRect]);

  if (!isOpen || steps.length === 0) {
    return null;
  }

  const activeStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const highlightBounds = targetRect
    ? {
        top: Math.max(OVERLAY_PADDING, targetRect.top - HIGHLIGHT_PADDING),
        left: Math.max(OVERLAY_PADDING, targetRect.left - HIGHLIGHT_PADDING),
        width: targetRect.width + HIGHLIGHT_PADDING * 2,
        height: targetRect.height + HIGHLIGHT_PADDING * 2,
      }
    : null;

  const handleNext = () => {
    if (isLastStep) {
      onFinish();
      return;
    }

    setCurrentStepIndex((previousIndex) => Math.min(previousIndex + 1, steps.length - 1));
  };

  const getClampedTooltipPosition = (left: number, top: number) => {
    const tooltipNode = tooltipRef.current;
    const tooltipWidth = tooltipNode?.offsetWidth ?? Math.min(360, window.innerWidth - OVERLAY_PADDING * 2);
    const tooltipHeight = tooltipNode?.offsetHeight ?? 240;

    return {
      left: clampValue(
        left,
        OVERLAY_PADDING,
        Math.max(OVERLAY_PADDING, window.innerWidth - tooltipWidth - OVERLAY_PADDING),
      ),
      top: clampValue(
        top,
        OVERLAY_PADDING,
        Math.max(OVERLAY_PADDING, window.innerHeight - tooltipHeight - OVERLAY_PADDING),
      ),
    };
  };

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    if (!tooltipRect) {
      return;
    }

    dragOffsetRef.current = {
      x: event.clientX - tooltipRect.left,
      y: event.clientY - tooltipRect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOffsetRef.current) {
      return;
    }

    const nextLeft = event.clientX - dragOffsetRef.current.x;
    const nextTop = event.clientY - dragOffsetRef.current.y;
    setManualPosition(getClampedTooltipPosition(nextLeft, nextTop));
  };

  const handleDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    dragOffsetRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[2000] isolate">
      {highlightBounds ? (
        <>
          <div
            className="pointer-events-auto fixed inset-x-0 top-0 bg-slate-950/72"
            style={{ height: highlightBounds.top }}
          />
          <div
            className="pointer-events-auto fixed left-0 bg-slate-950/72"
            style={{
              top: highlightBounds.top,
              width: highlightBounds.left,
              height: highlightBounds.height,
            }}
          />
          <div
            className="pointer-events-auto fixed right-0 bg-slate-950/72"
            style={{
              top: highlightBounds.top,
              width: Math.max(0, window.innerWidth - (highlightBounds.left + highlightBounds.width)),
              height: highlightBounds.height,
            }}
          />
          <div
            className="pointer-events-auto fixed inset-x-0 bottom-0 bg-slate-950/72"
            style={{
              top: highlightBounds.top + highlightBounds.height,
            }}
          />
        </>
      ) : (
        <div className="pointer-events-auto absolute inset-0 bg-slate-950/72" />
      )}

      {highlightBounds && (
        <div
          className="pointer-events-none absolute z-[1] rounded-[28px] border-2 border-farm-accent/80 shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_24px_60px_rgba(15,23,42,0.3)] transition-all duration-300"
          style={highlightBounds}
        />
      )}

      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`dashboard-tour-title-${activeStep.id}`}
        className={`pointer-events-auto fixed z-[2] rounded-[28px] border border-farm-border bg-farm-card/95 p-5 text-left shadow-2xl backdrop-blur-xl ${manualPosition ? '' : 'transition-all duration-300'}`}
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className="min-w-0 cursor-move select-none"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-farm-accent">
              {t('dashboard.tour.label')}
            </p>
            <h2 id={`dashboard-tour-title-${activeStep.id}`} className="mt-2 text-lg font-semibold text-white">
              {activeStep.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              {activeStep.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-farm-border/80 px-3 py-1 text-xs font-medium text-gray-300 transition hover:border-farm-accent/50 hover:text-white"
          >
            {t('dashboard.tour.skip')}
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs text-gray-400">
            {t('dashboard.tour.progress', {
              current: currentStepIndex + 1,
              total: steps.length,
            })}
          </span>

          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={`h-2 rounded-full transition-all ${
                  index === currentStepIndex ? 'w-6 bg-farm-accent' : 'w-2 bg-farm-border'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentStepIndex((previousIndex) => Math.max(previousIndex - 1, 0))}
            className="rounded-full border border-farm-border px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-farm-accent/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            disabled={currentStepIndex === 0}
          >
            {t('dashboard.tour.back')}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="rounded-full bg-farm-accent px-4 py-2 text-sm font-semibold text-farm-bg transition hover:brightness-110"
          >
            {isLastStep ? t('dashboard.tour.finish') : t('dashboard.tour.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTour;
