'use client';

import { useState, useCallback } from 'react';
import CameraAnalysis, { EngineState } from '../../../../../../ino-engine/web-overlay/CameraAnalysis';

export default function ExerciseAnalysisPage() {
  const [summary, setSummary] = useState<EngineState | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const handleFinish = useCallback((data: EngineState) => {
    setSummary(data);
    setIsFinished(true);
  }, []);

  const handleRestart = useCallback(() => {
    setSummary(null);
    setIsFinished(false);
  }, []);

  if (isFinished && summary) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-2 font-semibold text-[var(--color-text-primary)]">
              Session Complete
            </h1>
            <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
              Here is your exercise analysis summary.
            </p>
          </div>
          <button
            onClick={handleRestart}
            className="rounded-lg bg-brand-600 px-4 py-2 text-body-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            New Session
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Object.entries(summary.sub).map(([key, val]) => (
            <div
              key={key}
              className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4 text-center"
            >
              <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
                {key}
              </p>
              <p
                className="text-heading-2 font-bold tabular-nums mt-1"
                style={{
                  color:
                    val >= 80
                      ? 'var(--color-success)'
                      : val >= 60
                      ? 'var(--color-warning)'
                      : 'var(--color-error)',
                }}
              >
                {val}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-6">
          <h3 className="text-body-md font-semibold text-[var(--color-text-primary)] mb-2">
            Overall Form Score
          </h3>
          <p className="text-heading-1 font-bold tabular-nums" style={{
            color:
              summary.overall >= 80
                ? 'var(--color-success)'
                : summary.overall >= 60
                ? 'var(--color-warning)'
                : 'var(--color-error)',
          }}>
            {summary.overall}/100
          </p>
          <p className="text-body-sm text-[var(--color-text-secondary)] mt-2">
            Reps: L {summary.left_reps} / R {summary.right_reps}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-heading-2 font-semibold text-[var(--color-text-primary)]">
          Exercise Analysis
        </h1>
        <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
          Real-time AI form analysis using your webcam.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border-light)] overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <CameraAnalysis onFinish={handleFinish} />
      </div>
    </div>
  );
}
