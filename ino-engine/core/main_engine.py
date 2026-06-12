"""
main_engine.py
--------------
Full Exercise-Intelligence loop. Extends the bicep main.py: same MediaPipe
capture, but each frame also runs injury screening, and every completed rep
feeds the fatigue, imbalance, and session-logger modules. All of it is written
to muscle_state.js (a superset of the old contract — the overlay ignores
fields it doesn't use), and the session is persisted on exit so the AI coach
has history to learn from.

    pip install mediapipe==0.10.9 opencv-python numpy
    python main_engine.py --exercise "Barbell Curl" --weight 15 --user ruben

Keys:  q quit & save · r reset set
"""
from __future__ import annotations

import argparse
import dataclasses
import json
import logging
import signal
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

import cv2
import mediapipe as mp

try:
    from detectors.bicep_curl_detector import BicepCurlConfig, BicepCurlDetector
    from detectors.injury_risk_detector import InjuryRiskDetector
    from detectors.fatigue_detector import FatigueDetector
    from detectors.imbalance_detector import ImbalanceDetector
    from coaching.session_logger import SessionLogger
except ImportError:
    from bicep_curl_detector import BicepCurlConfig, BicepCurlDetector  # type: ignore[no-redef]
    from injury_risk_detector import InjuryRiskDetector  # type: ignore[no-redef]
    from fatigue_detector import FatigueDetector  # type: ignore[no-redef]
    from imbalance_detector import ImbalanceDetector  # type: ignore[no-redef]
    from session_logger import SessionLogger  # type: ignore[no-redef]

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s  %(levelname)-7s  %(message)s",
                    datefmt="%H:%M:%S")
log = logging.getLogger("engine")

STATE_PATH = Path(__file__).with_name("muscle_state.js")


def write_state(data: dict) -> None:
    payload = "window.__muscleState = " + json.dumps(data) + ";"
    tmp = STATE_PATH.with_suffix(".tmp")
    tmp.write_text(payload, encoding="utf-8")
    tmp.replace(STATE_PATH)


def _vel(rom, tempo):
    return (rom / tempo) if (rom and tempo) else None


def run(source, exercise: str, weight: float, user: str,
        width: int = 640, height: int = 480) -> None:
    mp_pose = mp.solutions.pose
    mp_draw = mp.solutions.drawing_utils

    bicep = BicepCurlDetector(BicepCurlConfig())
    injury = InjuryRiskDetector()
    fatigue = FatigueDetector()
    imbalance = ImbalanceDetector()
    logger = SessionLogger(user=user)
    logger.start_session()

    prev = {"l": 0, "r": 0}

    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open source {source!r}")
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

    cv2.namedWindow("INO Engine", cv2.WINDOW_NORMAL)
    log.info("Open muscle_overlay.html — engine polling %s", STATE_PATH.name)

    with mp_pose.Pose(min_detection_confidence=0.6, min_tracking_confidence=0.6) as pose:
        while cap.isOpened():
            ok, frame = cap.read()
            if not ok:
                break
            h, w = frame.shape[:2]
            display = frame.copy()
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb.flags.writeable = False
            results = pose.process(rgb)

            payload = {"left_reps": bicep.left.reps, "right_reps": bicep.right.reps}

            if results.pose_landmarks:
                mp_draw.draw_landmarks(display, results.pose_landmarks,
                                       mp_pose.POSE_CONNECTIONS)
                res = bicep.process_frame(display, results.pose_landmarks, w, h)
                display = res.frame

                # --- feed analyzers on each newly completed rep ---
                for side, key in (("left", "l"), ("right", "r")):
                    reps = getattr(res, f"{side}_reps")
                    if reps > prev[key]:
                        rom = getattr(res, f"{side}_rom")
                        tempo = getattr(res, f"{side}_tempo")
                        form = getattr(res, f"{side}_score")
                        fatigue.update_rep(rom, tempo, form, _vel(rom, tempo))
                        imbalance.update_side(side, rom=rom, velocity=_vel(rom, tempo))
                        logger.log_rep(exercise, side=side, rom=rom, tempo=tempo,
                                       form=form, velocity=_vel(rom, tempo))
                        prev[key] = reps
                imbalance.set_reps(res.left_reps, res.right_reps)

                injury_flags = injury.process(results.pose_landmarks, w, h)
                fat = fatigue.state()
                imb = imbalance.report()

                payload.update({
                    "left_angle": res.left_angle, "right_angle": res.right_angle,
                    "left_form": res.left_form, "right_form": res.right_form,
                    "left_score": res.left_score, "right_score": res.right_score,
                    "overall": res.overall, "sub": res.sub,
                    "left_rom": res.left_rom, "right_rom": res.right_rom,
                    "left_tempo": res.left_tempo, "right_tempo": res.right_tempo,
                    "cue": res.cue,
                    "fatigue": {"level": fat.level, "status": fat.status,
                                "rir": fat.rir, "reason": fat.reason},
                    "imbalance": dataclasses.asdict(imb),
                    "injury": injury_flags,
                    "injury_worst": InjuryRiskDetector.worst(injury_flags),
                })
            else:
                cv2.putText(display, "No pose — step into frame", (20, 44),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (40, 80, 255), 2)

            write_state(payload)
            cv2.imshow("INO Engine", display)
            k = cv2.waitKey(1) & 0xFF
            if k == ord("q"):
                break
            if k == ord("r"):
                bicep.reset(); fatigue.reset(); imbalance.reset()
                logger.end_set(exercise, weight=weight)
                prev = {"l": 0, "r": 0}

    # close out & persist for the coach
    logger.end_set(exercise, weight=weight)
    path = logger.save()
    log.info("Session saved to %s", path)
    cap.release()
    cv2.destroyAllWindows()


def _args():
    p = argparse.ArgumentParser(description="INO Exercise Intelligence Engine")
    p.add_argument("--source", default=0)
    p.add_argument("--exercise", default="Barbell Curl")
    p.add_argument("--weight", type=float, default=0.0)
    p.add_argument("--user", default="default")
    p.add_argument("--width", type=int, default=640)
    p.add_argument("--height", type=int, default=480)
    return p.parse_args()


if __name__ == "__main__":
    signal.signal(signal.SIGINT, lambda *_: (cv2.destroyAllWindows(), sys.exit(0)))
    a = _args()
    src = int(a.source) if str(a.source).isdigit() else a.source
    run(src, a.exercise, a.weight, a.user, a.width, a.height)
