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
  onNavigatePage?: (page: string) => void;
  onFinish: () => void;
  onSkip: () => void;
}

const OVERLAY_PADDING = 12;
const TOOLTIP_GAP = 18;
const HIGHLIGHT_PADDING = 10;

const DashboardTour: React.FC<DashboardTourProps> = ({
  isOpen,
  activePage,
  steps,
  onNavigatePage,
  onFinish,
  onSkip,
}) => {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const syncTargetRect = useEffectEvent(() => {
    if (!isOpen) {
      return;
    }

    const targetNode = steps[currentStepIndex]?.targetRef.current;
    setTargetRect(targetNode ? targetNode.getBoundingClientRect() : null);
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

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
  }, [currentStepIndex, isOpen, targetRect]);

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
        className="pointer-events-auto fixed z-[2] rounded-[28px] border border-farm-border bg-farm-card/95 p-5 text-left shadow-2xl backdrop-blur-xl transition-all duration-300"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
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
