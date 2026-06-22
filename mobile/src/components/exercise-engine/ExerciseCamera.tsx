import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// ---------------------------------------------------------------------------
// Theme — Midnight Athlete
// ---------------------------------------------------------------------------
const C = {
  bg:         '#0A0F1E',
  surface:    '#0C1220',
  surfaceAlt: '#111827',
  brand:      '#2563EB',
  accent:     '#10B981',
  error:      '#EF4444',
  warning:    '#F59E0B',
  text:       '#F1F5F9',
  textDim:    '#94A3B8',
  textMuted:  '#64748B',
  divider:    '#1E293B',
  ring:       '#1E293B',
} as const;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const RING_SIZE = 88;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ---------------------------------------------------------------------------
// EngineState — mirrors the Python engine's JSON contract
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
// Mock data generator — simulates engine polling until real API is wired
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
    cue: tick < 15
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
        tick < 30 ? 'Fresh' : tick < 60 ? 'Working' : tick < 90 ? 'Fatiguing' : 'Near failure',
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
      weaker: leftReps < rightReps ? 'left' : rightReps < leftReps ? 'right' : '',
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
// Props
// ---------------------------------------------------------------------------
interface ExerciseCameraProps {
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
export default function ExerciseCamera({
  exerciseName = 'Barbell Curl',
  setNumber = 1,
  apiBaseUrl,
  sessionId: externalSessionId,
  userId = 'default',
  onEndSet,
  onFinish,
}: ExerciseCameraProps) {
  const API_BASE = apiBaseUrl || process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8095';

  // --- state ---------------------------------------------------------------
  const [engine, setEngine] = useState<EngineState | null>(null);
  const [prevReps, setPrevReps] = useState({ left: 0, right: 0 });
  const [isActive, setIsActive] = useState(true);
  const [currentSet, setCurrentSet] = useState(setNumber);
  const [elapsed, setElapsed] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(externalSessionId ?? null);
  const [isOffline, setIsOffline] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  // --- animated values -----------------------------------------------------
  const repFlashLeft = useRef(new Animated.Value(0)).current;
  const repFlashRight = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const fatigueAnim = useRef(new Animated.Value(0)).current;
  const injurySlide = useRef(new Animated.Value(-80)).current;
  const cueOpacity = useRef(new Animated.Value(1)).current;

  // tick counter for mock data fallback
  const tickRef = useRef(0);

  // --- start session on mount ----------------------------------------------
  useEffect(() => {
    if (externalSessionId) return; // session already provided externally

    let cancelled = false;

    async function startSession() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/engine/start-session`, {
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
        // API unreachable — operate in offline/mock mode
        if (!cancelled) {
          setIsOffline(true);
        }
      }
    }

    startSession();
    return () => { cancelled = true; };
  }, [API_BASE, exerciseName, userId, externalSessionId]);

  // --- polling loop (200 ms) -----------------------------------------------
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(async () => {
      tickRef.current += 1;

      // Try real API if we have a session ID
      if (activeSessionId && !isOffline) {
        try {
          const res = await fetch(`${API_BASE}/api/v1/engine/state/${activeSessionId}`);
          if (res.ok) {
            const data = await res.json();
            setEngine(data);
            return;
          }
        } catch {
          // API unreachable — fall through to mock
        }
      }

      // Fallback: generate mock state (offline mode)
      setEngine(generateMockState(tickRef.current));
    }, 200);

    return () => clearInterval(interval);
  }, [isActive, API_BASE, activeSessionId, isOffline]);

  // --- frame capture loop (2 Hz) -------------------------------------------
  // Snaps the live camera every 500 ms and ships it to /engine/analyze-frame.
  // The backend runs MediaPipe pose detection server-side and updates the
  // session state read by the polling loop above.
  useEffect(() => {
    if (!isActive || !activeSessionId || isOffline || !permission?.granted) return;

    let cancelled = false;
    let inFlight = false;

    const captureInterval = setInterval(async () => {
      if (cancelled || inFlight || !cameraRef.current) return;
      inFlight = true;
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.35,           // small payload → low latency
          skipProcessing: true,
          shutterSound: false,
        });
        if (cancelled || !photo?.base64) return;
        await fetch(`${API_BASE}/api/v1/engine/analyze-frame`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_base64: photo.base64,
            exercise: exerciseName,
            user_id: userId,
            session_id: activeSessionId,
          }),
        });
      } catch {
        // Best-effort — drop this frame, try again on the next tick
      } finally {
        inFlight = false;
      }
    }, 500);

    return () => {
      cancelled = true;
      clearInterval(captureInterval);
    };
  }, [isActive, activeSessionId, isOffline, permission?.granted, API_BASE, exerciseName, userId]);

  // --- session timer -------------------------------------------------------
  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  // --- rep flash animation -------------------------------------------------
  const flashRep = useCallback(
    (anim: Animated.Value) => {
      anim.setValue(1);
      Animated.timing(anim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [],
  );

  useEffect(() => {
    if (!engine) return;
    if (engine.left_reps > prevReps.left) flashRep(repFlashLeft);
    if (engine.right_reps > prevReps.right) flashRep(repFlashRight);
    setPrevReps({ left: engine.left_reps, right: engine.right_reps });
  }, [engine?.left_reps, engine?.right_reps]);

  // --- score ring animation ------------------------------------------------
  useEffect(() => {
    if (!engine?.overall) return;
    Animated.timing(scoreAnim, {
      toValue: engine.overall / 100,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [engine?.overall]);

  // --- fatigue bar animation -----------------------------------------------
  useEffect(() => {
    if (!engine) return;
    Animated.timing(fatigueAnim, {
      toValue: engine.fatigue.level / 100,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [engine?.fatigue.level]);

  // --- injury banner slide -------------------------------------------------
  useEffect(() => {
    if (!engine) return;
    const show = engine.injury_worst !== null;
    Animated.spring(injurySlide, {
      toValue: show ? 0 : -80,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [engine?.injury_worst?.slug, engine?.injury_worst?.level]);

  // --- cue text pulse on change -------------------------------------------
  const prevCue = useRef('');
  useEffect(() => {
    if (!engine || engine.cue === prevCue.current) return;
    prevCue.current = engine.cue;
    cueOpacity.setValue(0.3);
    Animated.timing(cueOpacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [engine?.cue]);

  // --- derived values ------------------------------------------------------
  const ringOffset = scoreAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_CIRCUMFERENCE, 0],
  });

  const fatigueWidth = fatigueAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const fatigueColor = !engine
    ? C.accent
    : engine.fatigue.level < 40
    ? C.accent
    : engine.fatigue.level < 70
    ? C.warning
    : C.error;

  const injuryBannerColor =
    engine?.injury_worst?.level === 'high' ? C.error : C.warning;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const scoreColor = (v: number) =>
    v >= 80 ? C.accent : v >= 60 ? C.warning : C.error;

  // --- handlers ------------------------------------------------------------
  const handleEndSet = useCallback(() => {
    setCurrentSet((s) => s + 1);
    tickRef.current = 0;
    onEndSet?.();
  }, [onEndSet]);

  const handleFinish = useCallback(async () => {
    setIsActive(false);

    // End the session on the backend
    if (activeSessionId && !isOffline) {
      try {
        await fetch(`${API_BASE}/api/v1/engine/end-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: activeSessionId }),
        });
      } catch {
        // Ignore — session cleanup is best-effort
      }
    }

    if (engine) onFinish?.(engine);
  }, [engine, onFinish, activeSessionId, isOffline, API_BASE]);

  // --- render --------------------------------------------------------------
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ============================================================ */}
      {/* Camera placeholder — swap with <CameraView> in production     */}
      {/* ============================================================ */}
      <View style={styles.cameraPreview}>
        {permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="front"
            mute
            mode="picture"
            animateShutter={false}
          />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraPlaceholderIcon}>{'{ }'}</Text>
            <Text style={styles.cameraPlaceholderText}>
              {permission ? 'Camera access required' : 'Initializing camera…'}
            </Text>
            <Text style={styles.cameraPlaceholderSub}>
              {permission && !permission.granted
                ? 'Tap below to grant camera access for live form analysis.'
                : isOffline
                ? 'Offline mode — using mock analysis'
                : `Connected to ${API_BASE}`}
            </Text>
            {permission && !permission.granted && (
              <TouchableOpacity
                onPress={requestPermission}
                style={styles.permissionCta}
                activeOpacity={0.85}
              >
                <Text style={styles.permissionCtaText}>Grant camera access</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ---- Injury warning banner (slides in from top) ---------- */}
        {engine?.injury_worst && (
          <Animated.View
            style={[
              styles.injuryBanner,
              {
                backgroundColor: injuryBannerColor + '22',
                borderColor: injuryBannerColor,
                transform: [{ translateY: injurySlide }],
              },
            ]}
          >
            <View
              style={[styles.injuryDot, { backgroundColor: injuryBannerColor }]}
            />
            <Text style={[styles.injuryText, { color: injuryBannerColor }]}>
              {engine.injury[engine.injury_worst.slug]?.msg ??
                engine.injury_worst.slug.replace(/_/g, ' ')}
            </Text>
          </Animated.View>
        )}

        {/* ---- Rep counters (top left + top right) ----------------- */}
        <View style={styles.repOverlay}>
          {/* Left reps */}
          <View style={styles.repBadge}>
            <Animated.View
              style={[
                styles.repFlash,
                {
                  opacity: repFlashLeft,
                  transform: [{ scale: repFlashLeft.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.8],
                  }) }],
                  backgroundColor: C.accent,
                },
              ]}
            />
            <Text style={styles.repLabel}>L</Text>
            <Text style={styles.repCount}>{engine?.left_reps ?? 0}</Text>
          </View>

          {/* Right reps */}
          <View style={styles.repBadge}>
            <Animated.View
              style={[
                styles.repFlash,
                {
                  opacity: repFlashRight,
                  transform: [{ scale: repFlashRight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.8],
                  }) }],
                  backgroundColor: C.brand,
                },
              ]}
            />
            <Text style={styles.repLabel}>R</Text>
            <Text style={styles.repCount}>{engine?.right_reps ?? 0}</Text>
          </View>
        </View>

        {/* ---- Form score ring (centered, lower third) ------------- */}
        <View style={styles.scoreRingContainer}>
          {/* SVG-free ring using an Animated border trick */}
          <View style={styles.scoreRingTrack}>
            <Animated.View
              style={[
                styles.scoreRingFill,
                {
                  borderColor: engine
                    ? scoreColor(engine.overall)
                    : C.textMuted,
                  // Use a conic-gradient approach via a workaround:
                  // We animate the text and rely on the track/fill visual
                },
              ]}
            />
            <View style={styles.scoreRingInner}>
              <Text
                style={[
                  styles.scoreRingValue,
                  {
                    color: engine
                      ? scoreColor(engine.overall)
                      : C.textMuted,
                  },
                ]}
              >
                {engine?.overall ?? '--'}
              </Text>
              <Text style={styles.scoreRingLabel}>FORM</Text>
            </View>
          </View>
        </View>

        {/* ---- Coaching cue (floating above bottom bar) ------------ */}
        <Animated.View style={[styles.cueContainer, { opacity: cueOpacity }]}>
          <Text style={styles.cueText} numberOfLines={2}>
            {engine?.cue ?? 'Initializing engine...'}
          </Text>
        </Animated.View>
      </View>

      {/* ============================================================ */}
      {/* Bottom info bar                                               */}
      {/* ============================================================ */}
      <View style={styles.bottomBar}>
        {/* Row 1: exercise info */}
        <View style={styles.exerciseRow}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exerciseName}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Set {currentSet}
              </Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{formatTime(elapsed)}</Text>
              {engine?.fatigue.rir != null && (
                <>
                  <View style={styles.metaDot} />
                  <Text style={[styles.metaText, { color: C.accent }]}>
                    {engine.fatigue.rir} RIR
                  </Text>
                </>
              )}
            </View>
          </View>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor:
                  engine?.fatigue.status === 'Near failure'
                    ? C.error + '22'
                    : engine?.fatigue.status === 'Fatiguing'
                    ? C.warning + '22'
                    : C.accent + '22',
                borderColor:
                  engine?.fatigue.status === 'Near failure'
                    ? C.error
                    : engine?.fatigue.status === 'Fatiguing'
                    ? C.warning
                    : C.accent,
              },
            ]}
          >
            <Text
              style={[
                styles.statusChipText,
                {
                  color:
                    engine?.fatigue.status === 'Near failure'
                      ? C.error
                      : engine?.fatigue.status === 'Fatiguing'
                      ? C.warning
                      : C.accent,
                },
              ]}
            >
              {engine?.fatigue.status ?? 'Ready'}
            </Text>
          </View>
        </View>

        {/* Row 2: fatigue bar */}
        <View style={styles.fatigueBarOuter}>
          <Animated.View
            style={[
              styles.fatigueBarFill,
              {
                width: fatigueWidth,
                backgroundColor: fatigueColor,
              },
            ]}
          />
        </View>
        <View style={styles.fatigueLabels}>
          <Text style={styles.fatigueLabelText}>Fatigue</Text>
          <Text style={[styles.fatigueLabelText, { fontVariant: ['tabular-nums'] }]}>
            {engine?.fatigue.level ?? 0}%
          </Text>
        </View>

        {/* Row 3: sub-score chips */}
        {engine?.sub && (
          <View style={styles.subScoreRow}>
            {Object.entries(engine.sub).map(([key, val]) => (
              <View key={key} style={styles.subScoreChip}>
                <Text style={styles.subScoreLabel}>{key}</Text>
                <Text
                  style={[
                    styles.subScoreValue,
                    { color: scoreColor(val), fontVariant: ['tabular-nums'] },
                  ]}
                >
                  {val}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Row 4: imbalance note */}
        {engine?.imbalance && engine.imbalance.severity !== 'even' && (
          <View style={styles.imbalanceRow}>
            <View
              style={[
                styles.imbalanceDot,
                {
                  backgroundColor:
                    engine.imbalance.severity === 'notable'
                      ? C.warning
                      : C.textMuted,
                },
              ]}
            />
            <Text style={styles.imbalanceText} numberOfLines={1}>
              {engine.imbalance.note}
            </Text>
          </View>
        )}

        {/* Row 5: action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.btnEndSet}
            onPress={handleEndSet}
            activeOpacity={0.7}
          >
            <Text style={styles.btnEndSetText}>End Set</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnFinish}
            onPress={handleFinish}
            activeOpacity={0.7}
          >
            <Text style={styles.btnFinishText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Camera area
  cameraPreview: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#060A14',
  },
  cameraPlaceholderIcon: {
    fontSize: 32,
    color: C.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  cameraPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textDim,
  },
  cameraPlaceholderSub: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 4,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  permissionCta: {
    marginTop: 18,
    paddingVertical: 11,
    paddingHorizontal: 22,
    backgroundColor: C.accent,
    borderRadius: 10,
  },
  permissionCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Injury banner
  injuryBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  injuryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  injuryText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },

  // Rep counters overlay
  repOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  repBadge: {
    width: 56,
    height: 72,
    borderRadius: 12,
    backgroundColor: C.surface + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  repFlash: {
    position: 'absolute',
    width: 56,
    height: 72,
    borderRadius: 12,
  },
  repLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1,
  },
  repCount: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    fontVariant: ['tabular-nums'],
    marginTop: -2,
  },

  // Form score ring
  scoreRingContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  scoreRingTrack: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: C.ring,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingFill: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  scoreRingInner: {
    alignItems: 'center',
  },
  scoreRingValue: {
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scoreRingLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 2,
    marginTop: -2,
  },

  // Coaching cue
  cueContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: C.surface + 'DD',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cueText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Bottom bar
  bottomBar: {
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.divider,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },

  // Exercise info
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: C.textMuted,
    fontVariant: ['tabular-nums'],
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.textMuted,
    marginHorizontal: 6,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Fatigue bar
  fatigueBarOuter: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.divider,
    overflow: 'hidden',
    marginBottom: 4,
  },
  fatigueBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  fatigueLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fatigueLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textMuted,
  },

  // Sub-score chips
  subScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subScoreChip: {
    alignItems: 'center',
    flex: 1,
  },
  subScoreLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  subScoreValue: {
    fontSize: 16,
    fontWeight: '800',
  },

  // Imbalance
  imbalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 12,
  },
  imbalanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  imbalanceText: {
    fontSize: 12,
    color: C.textDim,
    flex: 1,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnEndSet: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEndSetText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  btnFinish: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: C.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFinishText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
