"""
main.py
--------
Wires MediaPipe Pose → BicepCurlDetector → OpenCV display window
                                          → muscle_state.js  (polled by the browser overlay)

Requirements
~~~~~~~~~~~~
    pip install mediapipe==0.10.9 opencv-python numpy

Run
~~~
    python main.py                     # default webcam (device 0)
    python main.py --source video.mp4  # video file
    python main.py --source 1          # second webcam
    python main.py --width 1280 --height 720

Then open ``muscle_overlay.html`` in your browser — no web server required.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import signal
import sys
from pathlib import Path
from typing import Optional

import cv2
import mediapipe as mp

from bicep_curl_detector import BicepCurlConfig, BicepCurlDetector, FrameResult

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("muscle_tracker")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

WINDOW_TITLE = "Muscle Tracker — Bicep Curl"
STATE_PATH   = Path(__file__).with_name("muscle_state.js")

_POSE_CONNECTIONS_STYLE = dict(
    landmark_drawing_spec=mp.solutions.drawing_utils.DrawingSpec(
        color=(180, 180, 180), thickness=1, circle_radius=2
    ),
    connection_drawing_spec=mp.solutions.drawing_utils.DrawingSpec(
        color=(80, 190, 255), thickness=2
    ),
)

_INITIAL_STATE: dict = {
    "left_reps":   0,
    "right_reps":  0,
    "left_angle":  None,
    "right_angle": None,
    "left_form":   "—",
    "right_form":  "—",
    # enriched fields consumed by the INO overlay
    "left_score":  None,
    "right_score": None,
    "overall":     None,
    "sub":         {},
    "left_rom":    None,
    "right_rom":   None,
    "left_tempo":  None,
    "right_tempo": None,
    "cue":         "Ready. Start curling.",
}

# ---------------------------------------------------------------------------
# State persistence
# ---------------------------------------------------------------------------

def write_state(data: dict) -> None:
    """
    Serialise *data* as a JS assignment so the overlay HTML can poll it
    without a web server (avoids CORS restrictions on ``file://`` origins).

    The file is written atomically via a rename to prevent the browser from
    reading a half-written payload.
    """
    payload = "window.__muscleState = " + json.dumps(data) + ";"
    tmp = STATE_PATH.with_suffix(".tmp")
    tmp.write_text(payload, encoding="utf-8")
    tmp.replace(STATE_PATH)


# ---------------------------------------------------------------------------
# Capture loop
# ---------------------------------------------------------------------------

def _build_detector() -> BicepCurlDetector:
    return BicepCurlDetector(
        config=BicepCurlConfig(
            angle_down=160,
            angle_up=40,
            smooth_window=5,
            state_hold_frames=3,
        )
    )


def _open_capture(source: str | int, width: int, height: int) -> cv2.VideoCapture:
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video source: {source!r}")
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    return cap


def _log_result(result: FrameResult) -> None:
    if result.left_angle is not None and result.right_angle is not None:
        log.info(
            "L %d reps  R %d reps  |  L angle %.1f°  R angle %.1f°",
            result.left_reps,  result.right_reps,
            result.left_angle, result.right_angle,
        )


def run(
    source: str | int,
    width: int  = 640,
    height: int = 480,
) -> None:
    """
    Main capture-and-detect loop.

    Blocks until the user presses **q** (quit) or **r** (reset), or until
    the video source is exhausted.  SIGINT (Ctrl-C) is handled gracefully.
    """
    mp_pose = mp.solutions.pose
    mp_draw = mp.solutions.drawing_utils

    detector = _build_detector()
    cap      = _open_capture(source, width, height)

    write_state(_INITIAL_STATE)
    log.info("Open muscle_overlay.html in your browser — polling %s", STATE_PATH)

    cv2.namedWindow(WINDOW_TITLE, cv2.WINDOW_NORMAL)

    with mp_pose.Pose(
        min_detection_confidence=0.6,
        min_tracking_confidence=0.6,
    ) as pose:

        while cap.isOpened():
            ok, frame = cap.read()
            if not ok:
                log.info("End of video source.")
                break

            h, w = frame.shape[:2]
            display = frame.copy()

            try:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                rgb.flags.writeable = False
                results = pose.process(rgb)

                if results.pose_landmarks:
                    mp_draw.draw_landmarks(
                        display,
                        results.pose_landmarks,
                        mp_pose.POSE_CONNECTIONS,
                        **_POSE_CONNECTIONS_STYLE,
                    )

                    result = detector.process_frame(
                        display,
                        results.pose_landmarks,
                        w, h,
                    )
                    display = result.frame

                    write_state({
                        "left_reps":   result.left_reps,
                        "right_reps":  result.right_reps,
                        "left_angle":  result.left_angle,
                        "right_angle": result.right_angle,
                        "left_form":   result.left_form,
                        "right_form":  result.right_form,
                        "left_score":  result.left_score,
                        "right_score": result.right_score,
                        "overall":     result.overall,
                        "sub":         result.sub,
                        "left_rom":    result.left_rom,
                        "right_rom":   result.right_rom,
                        "left_tempo":  result.left_tempo,
                        "right_tempo": result.right_tempo,
                        "cue":         result.cue,
                    })

                    _log_result(result)

                else:
                    cv2.putText(
                        display, "No pose detected — step into frame",
                        (20, 44),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9,
                        (40, 80, 255), 2, cv2.LINE_AA,
                    )

            except Exception:
                log.exception("Frame processing error")

            cv2.imshow(WINDOW_TITLE, display)

            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                log.info("Quit key pressed.")
                break
            elif key == ord("r"):
                detector.reset()
                write_state(_INITIAL_STATE)

    cap.release()
    cv2.destroyAllWindows()
    log.info("Session ended.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Muscle Tracker — real-time bicep curl counter",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--source", default=0,
        metavar="SOURCE",
        help="Video source: 0 for the default webcam, an integer for another "
             "device index, or a path to a video file.",
    )
    parser.add_argument("--width",  type=int, default=640,  help="Capture width in px.")
    parser.add_argument("--height", type=int, default=480,  help="Capture height in px.")
    return parser.parse_args()


def _coerce_source(raw: str | int) -> str | int:
    """Convert a digit-only string argument to an integer device index."""
    if isinstance(raw, str) and raw.isdigit():
        return int(raw)
    return raw


def _install_signal_handler() -> None:
    """Ensure Ctrl-C releases the camera and destroys OpenCV windows cleanly."""
    def _handler(sig, frame):
        log.info("Interrupted — cleaning up.")
        cv2.destroyAllWindows()
        sys.exit(0)

    signal.signal(signal.SIGINT, _handler)


if __name__ == "__main__":
    _install_signal_handler()
    args   = _parse_args()
    source = _coerce_source(args.source)
    run(source, width=args.width, height=args.height)
