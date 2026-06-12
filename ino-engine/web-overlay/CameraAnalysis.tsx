'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

// ---------------------------------------------------------------------------
// EngineState — mirrors the Python engine JSON contract
// ---------------------------------------------------------------------------
export interface EngineState {
  left_reps: number;
  right_reps: number;
  left_score: number;
  right_score: number;
  overall: number;
  sub: {
    ROM: number;
    Tempo: number;
    Symmetry: number;
    Control: number;
    Stability: number;
  };
  cue: string;
  fatigue: {
    level: number;
    status: string;
    rir: number;
    reason: string;
  };
  injury: Record<string, { level: string; value: number; msg: string }>;
  injury_worst: { slug: string; level: string } | null;
  imbalance: {
    weaker: string;
    severity: string;
    note: string;
  };
}

// ---------------------------------------------------------------------------
// Mock data generator
// ---------------------------------------------------------------------------
function generateMockState(tick: number): EngineState {
  const baseReps = Math.floor(tick / 30);
  const leftReps = Math.min(baseReps, 12);
  const rightReps = Math.min(Math.max(baseReps - 1, 0), 12);
  const phase = Math.sin(tick * 0.05);
  const overall = Math.round(78 + phase * 12);

  return {
    left_reps: leftReps,
    right_reps: rightReps,
    left_score: Math.round(80 + phase * 10),
    right_score: Math.round(76 + phase * 8),
    overall,
    sub: {
      ROM: Math.round(82 + phase * 8),
      Tempo: Math.round(85 + Math.sin(tick * 0.03) * 7),
      Symmetry: Math.round(88 - Math.abs(leftReps - rightReps) * 6),
      Control: Math.round(80 + Math.cos(tick * 0.04) * 10),
      Stability: Math.round(84 + phase * 6),
    },
    cue:
      tick < 15
        ? 'Step into frame — show both arms.'
        : [
            'Clean reps — keep the tempo controlled.',
            'Squeeze higher at the top — full contraction.',
            'Slow the eccentric — no swinging.',
            'Extend all the way down — own the stretch.',
            'Your left arm is lagging — even it out.',
          ][Math.floor(tick / 25) % 5],
    fatigue: {
      level: Math.min(Math.round(tick * 0.8), 100),
      status:
        tick < 30
          ? 'Fresh'
          : tick < 60
          ? 'Working'
          : tick < 90
          ? 'Fatiguing'
          : 'Near failure',
      rir: Math.max(0, Math.round(4 - tick * 0.04)),
      reason:
        tick < 30
          ? 'Establishing baseline'
          : tick < 60
          ? 'Holding output.'
          : 'Velocity and ROM are dropping.',
    },
    injury:
      tick > 40
        ? {
            rounded_shoulders: {
              level: tick > 80 ? 'high' : 'watch',
              value: 0.14,
              msg: 'Pull your head back — stack ears over shoulders.',
            },
            knee_valgus: {
              level: tick > 70 ? 'watch' : 'low',
              value: 0.08,
              msg: 'Drive your knees out — track over your toes.',
            },
          }
        : {},
    injury_worst:
      tick > 80
        ? { slug: 'rounded_shoulders', level: 'high' }
        : tick > 40
        ? { slug: 'rounded_shoulders', level: 'watch' }
        : null,
    imbalance: {
      weaker:
        leftReps < rightReps
          ? 'left'
          : rightReps < leftReps
          ? 'right'
          : '',
      severity:
        Math.abs(leftReps - rightReps) >= 3
          ? 'notable'
          : Math.abs(leftReps - rightReps) >= 1
          ? 'minor'
          : 'even',
      note:
        leftReps === rightReps
          ? 'Sides are balanced — keep it symmetric.'
          : `${leftReps < rightReps ? 'Left' : 'Right'} side lagging — add a few unilateral sets.`,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function scoreColor(v: number): string {
  if (v >= 80) return '#10B981';
  if (v >= 60) return '#F59E0B';
  return '#EF4444';
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function injuryLevelColor(level: string): string {
  if (level === 'high') return '#EF4444';
  if (level === 'watch') return '#F59E0B';
  return '#64748B';
}

function slugToLabel(slug: string): string {
  return slug
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface CameraAnalysisProps {
  exerciseName?: string;
  setNumber?: number;
  apiBaseUrl?: string;
  sessionId?: string;
  userId?: string;
  onEndSet?: () => void;
  onFinish?: (summary: EngineState) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CameraAnalysis({
  exerciseName = 'Barbell Curl',
  setNumber = 1,
  apiBaseUrl = 'http://localhost:8095',
  sessionId: externalSessionId,
  userId = 'default',
  onEndSet,
  onFinish,
}: CameraAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [engine, setEngine] = useState<EngineState | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [currentSet, setCurrentSet] = useState(setNumber);
  const [elapsed, setElapsed] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(externalSessionId ?? null);
  const [isOffline, setIsOffline] = useState(false);

  const tickRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  // --- webcam setup --------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err: any) {
        if (!cancelled) {
          setCameraError(
            err?.message ?? 'Camera permission denied or not available.',
          );
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // --- start session on mount -----------------------------------------------
  useEffect(() => {
    if (externalSessionId) return;

    let cancelled = false;

    async function startSession() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/v1/engine/start-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, exercise: exerciseName }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setActiveSessionId(data.session_id);
          setIsOffline(false);
        }
      } catch {
        if (!cancelled) setIsOffline(true);
      }
    }

    startSession();
    return () => { cancelled = true; };
  }, [apiBaseUrl, exerciseName, userId, externalSessionId]);

  // --- engine polling (200 ms) — capture frame + POST to API ---------------
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(async () => {
      tickRef.current += 1;

      // Try real API: capture a frame and POST to the engine
      if (!isOffline && cameraReady) {
        try {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (canvas && video) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, 640, 480);
              const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/jpeg', 0.7),
              );
              if (blob) {
                const form = new FormData();
                form.append('frame', blob, 'frame.jpg');
                if (activeSessionId) {
                  form.append('session_id', activeSessionId);
                }
                const res = await fetch(`${apiBaseUrl}/api/v1/engine/analyze`, {
                  method: 'POST',
                  body: form,
                });
                if (res.ok) {
                  const data = await res.json();
                  setEngine(data);
                  return;
                }
              }
            }
          }
        } catch {
          // API unreachable — fall through to mock
        }
      }

      // Fallback: generate mock state (offline mode)
      setEngine(generateMockState(tickRef.current));
    }, 200);

    return () => clearInterval(interval);
  }, [isActive, apiBaseUrl, activeSessionId, isOffline, cameraReady]);

  // --- session timer -------------------------------------------------------
  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  // --- handlers ------------------------------------------------------------
  const handleEndSet = useCallback(() => {
    setCurrentSet((s) => s + 1);
    tickRef.current = 0;
    onEndSet?.();
  }, [onEndSet]);

  const handleFinish = useCallback(async () => {
    setIsActive(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());

    // End the session on the backend
    if (activeSessionId && !isOffline) {
      try {
        await fetch(`${apiBaseUrl}/api/v1/engine/end-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: activeSessionId }),
        });
      } catch {
        // Ignore — session cleanup is best-effort
      }
    }

    if (engine) onFinish?.(engine);
  }, [engine, onFinish, activeSessionId, isOffline, apiBaseUrl]);

  // --- derived -------------------------------------------------------------
  const injuryEntries = useMemo(
    () =>
      engine
        ? Object.entries(engine.injury).filter(
            ([, v]) => v.level === 'watch' || v.level === 'high',
          )
        : [],
    [engine],
  );

  const fatigueBarColor =
    !engine
      ? '#10B981'
      : engine.fatigue.level < 40
      ? '#10B981'
      : engine.fatigue.level < 70
      ? '#F59E0B'
      : '#EF4444';

  // --- render --------------------------------------------------------------
  return (
    <div style={containerStyle}>
      {/* ============================================================= */}
      {/* LEFT: Camera feed + overlay                                    */}
      {/* ============================================================= */}
      <div style={leftPanelStyle}>
        {cameraError ? (
          <div style={cameraErrorStyle}>
            <span style={{ fontSize: 28, marginBottom: 8 }}>:/</span>
            <span style={{ fontWeight: 600 }}>{cameraError}</span>
            <span style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
              Check browser camera permissions and try again.
            </span>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              style={videoStyle}
              autoPlay
              playsInline
              muted
            />
            {/* Hidden canvas for frame capture */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              style={{ display: 'none' }}
            />

            {/* Pose skeleton overlay placeholder */}
            {!cameraReady && (
              <div style={loadingOverlayStyle}>
                <span style={{ color: '#94A3B8' }}>Starting camera...</span>
              </div>
            )}

            {/* Rep counter overlay */}
            <div style={repOverlayStyle}>
              <div style={repBadgeStyle}>
                <span style={repLabelStyle}>L</span>
                <span style={repCountStyle}>{engine?.left_reps ?? 0}</span>
              </div>
              <div style={repBadgeStyle}>
                <span style={repLabelStyle}>R</span>
                <span style={repCountStyle}>{engine?.right_reps ?? 0}</span>
              </div>
            </div>

            {/* Coaching cue overlay */}
            <div style={cueOverlayStyle}>
              <span style={cueTextStyle}>
                {engine?.cue ?? 'Initializing engine...'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ============================================================= */}
      {/* RIGHT: Data panel                                              */}
      {/* ============================================================= */}
      <div style={rightPanelStyle}>
        {/* Exercise header */}
        <div style={headerStyle}>
          <h2 style={exerciseNameStyle}>{exerciseName}</h2>
          <div style={metaRowStyle}>
            <span style={metaStyle}>Set {currentSet}</span>
            <span style={metaDotStyle} />
            <span style={{ ...metaStyle, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(elapsed)}
            </span>
          </div>
        </div>

        {/* Form score ring */}
        <div style={scoreBlockStyle}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            {/* Track */}
            <circle
              cx={60}
              cy={60}
              r={52}
              fill="none"
              stroke="#1E293B"
              strokeWidth={8}
            />
            {/* Fill arc */}
            <circle
              cx={60}
              cy={60}
              r={52}
              fill="none"
              stroke={engine ? scoreColor(engine.overall) : '#64748B'}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${
                2 * Math.PI * 52 * (1 - (engine?.overall ?? 0) / 100)
              }`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
            />
          </svg>
          <div style={scoreTextOverlayStyle}>
            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: engine ? scoreColor(engine.overall) : '#64748B',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {engine?.overall ?? '--'}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: 2,
              }}
            >
              FORM
            </span>
          </div>
        </div>

        {/* Sub-scores */}
        <div style={subScoreGridStyle}>
          {engine?.sub &&
            Object.entries(engine.sub).map(([key, val]) => (
              <div key={key} style={subScoreItemStyle}>
                <span style={subScoreLabelStyle}>{key}</span>
                <span
                  style={{
                    ...subScoreValueStyle,
                    color: scoreColor(val),
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
        </div>

        {/* Divider */}
        <div style={dividerStyle} />

        {/* Fatigue meter */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <span style={sectionTitleStyle}>Fatigue</span>
            <span
              style={{
                ...statusBadgeStyle,
                color:
                  engine?.fatigue.status === 'Near failure'
                    ? '#EF4444'
                    : engine?.fatigue.status === 'Fatiguing'
                    ? '#F59E0B'
                    : '#10B981',
                backgroundColor:
                  (engine?.fatigue.status === 'Near failure'
                    ? '#EF4444'
                    : engine?.fatigue.status === 'Fatiguing'
                    ? '#F59E0B'
                    : '#10B981') + '1A',
              }}
            >
              {engine?.fatigue.status ?? 'Ready'}
            </span>
          </div>
          <div style={fatigueBarOuterStyle}>
            <div
              style={{
                ...fatigueBarFillStyle,
                width: `${engine?.fatigue.level ?? 0}%`,
                backgroundColor: fatigueBarColor,
              }}
            />
          </div>
          <div style={fatigueMetaStyle}>
            <span style={fatiguePctStyle}>
              {engine?.fatigue.level ?? 0}%
            </span>
            {engine?.fatigue.rir != null && (
              <span style={rirStyle}>{engine.fatigue.rir} RIR</span>
            )}
          </div>
          <span style={fatigueReasonStyle}>
            {engine?.fatigue.reason ?? ''}
          </span>
        </div>

        {/* Divider */}
        <div style={dividerStyle} />

        {/* Injury flags */}
        <div style={sectionStyle}>
          <span style={sectionTitleStyle}>Injury Screening</span>
          {injuryEntries.length === 0 ? (
            <span style={allClearStyle}>All clear</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {injuryEntries.map(([slug, data]) => (
                <div
                  key={slug}
                  style={{
                    ...injuryCardStyle,
                    borderLeftColor: injuryLevelColor(data.level),
                  }}
                >
                  <div style={injuryCardHeaderStyle}>
                    <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 13 }}>
                      {slugToLabel(slug)}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: injuryLevelColor(data.level),
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      {data.level}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#94A3B8', lineHeight: '18px' }}>
                    {data.msg}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={dividerStyle} />

        {/* Imbalance */}
        <div style={sectionStyle}>
          <span style={sectionTitleStyle}>Imbalance</span>
          {engine?.imbalance && (
            <div style={imbalanceCardStyle}>
              <div style={imbalanceSeverityRowStyle}>
                <span
                  style={{
                    ...imbalanceSeverityBadgeStyle,
                    color:
                      engine.imbalance.severity === 'notable'
                        ? '#F59E0B'
                        : engine.imbalance.severity === 'minor'
                        ? '#94A3B8'
                        : '#10B981',
                    backgroundColor:
                      (engine.imbalance.severity === 'notable'
                        ? '#F59E0B'
                        : engine.imbalance.severity === 'minor'
                        ? '#94A3B8'
                        : '#10B981') + '1A',
                  }}
                >
                  {engine.imbalance.severity}
                </span>
                {engine.imbalance.weaker && (
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    Weaker: {engine.imbalance.weaker}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#94A3B8', lineHeight: '18px' }}>
                {engine.imbalance.note}
              </span>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <div style={actionRowStyle}>
          <button style={btnEndSetStyle} onClick={handleEndSet}>
            End Set
          </button>
          <button style={btnFinishStyle} onClick={handleFinish}>
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline styles (CSS-in-JS, Midnight Athlete theme)
// ---------------------------------------------------------------------------
const containerStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  height: '100vh',
  backgroundColor: '#0A0F1E',
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  color: '#F1F5F9',
};

const leftPanelStyle: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  backgroundColor: '#000',
  overflow: 'hidden',
  minWidth: 0,
};

const cameraErrorStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#94A3B8',
  gap: 4,
};

const videoStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const loadingOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#060A14',
};

const repOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  right: 16,
  display: 'flex',
  justifyContent: 'space-between',
};

const repBadgeStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 68,
  borderRadius: 12,
  backgroundColor: '#0C1220CC',
  backdropFilter: 'blur(8px)',
};

const repLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#64748B',
  letterSpacing: 1,
};

const repCountStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  color: '#F1F5F9',
  fontVariantNumeric: 'tabular-nums',
};

const cueOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 16,
  left: 16,
  right: 16,
  backgroundColor: '#0C1220DD',
  backdropFilter: 'blur(8px)',
  borderRadius: 10,
  padding: '10px 14px',
  textAlign: 'center',
};

const cueTextStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#F1F5F9',
  lineHeight: '20px',
};

// --- Right panel ---
const rightPanelStyle: React.CSSProperties = {
  width: 340,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#0C1220',
  borderLeft: '1px solid #1E293B',
  padding: '20px 20px 16px',
  overflowY: 'auto',
};

const headerStyle: React.CSSProperties = {
  marginBottom: 20,
};

const exerciseNameStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  margin: 0,
  color: '#F1F5F9',
};

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginTop: 2,
};

const metaStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#64748B',
};

const metaDotStyle: React.CSSProperties = {
  width: 3,
  height: 3,
  borderRadius: '50%',
  backgroundColor: '#64748B',
};

// Score ring block
const scoreBlockStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
};

const scoreTextOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

// Sub-scores
const subScoreGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: 4,
  marginBottom: 4,
};

const subScoreItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const subScoreLabelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  color: '#64748B',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  marginBottom: 2,
};

const subScoreValueStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  fontVariantNumeric: 'tabular-nums',
};

// Divider
const dividerStyle: React.CSSProperties = {
  height: 1,
  backgroundColor: '#1E293B',
  margin: '12px 0',
};

// Section
const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#94A3B8',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
};

const statusBadgeStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: 6,
  letterSpacing: 0.4,
};

// Fatigue bar
const fatigueBarOuterStyle: React.CSSProperties = {
  height: 6,
  borderRadius: 3,
  backgroundColor: '#1E293B',
  overflow: 'hidden',
};

const fatigueBarFillStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: 3,
  transition: 'width 0.4s ease, background-color 0.4s ease',
};

const fatigueMetaStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 4,
};

const fatiguePctStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#64748B',
  fontVariantNumeric: 'tabular-nums',
};

const rirStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#10B981',
  fontVariantNumeric: 'tabular-nums',
};

const fatigueReasonStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#64748B',
  marginTop: 2,
};

// Injury cards
const allClearStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#10B981',
  marginTop: 6,
};

const injuryCardStyle: React.CSSProperties = {
  backgroundColor: '#111827',
  borderRadius: 8,
  borderLeft: '3px solid',
  padding: '8px 10px',
};

const injuryCardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
};

// Imbalance
const imbalanceCardStyle: React.CSSProperties = {
  backgroundColor: '#111827',
  borderRadius: 8,
  padding: '10px 12px',
  marginTop: 8,
};

const imbalanceSeverityRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 4,
};

const imbalanceSeverityBadgeStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: 4,
  textTransform: 'uppercase',
  letterSpacing: 0.8,
};

// Action buttons
const actionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  marginTop: 16,
};

const btnEndSetStyle: React.CSSProperties = {
  flex: 1,
  height: 40,
  borderRadius: 8,
  backgroundColor: '#111827',
  border: '1px solid #1E293B',
  color: '#F1F5F9',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const btnFinishStyle: React.CSSProperties = {
  flex: 1,
  height: 40,
  borderRadius: 8,
  backgroundColor: '#2563EB',
  border: 'none',
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};
