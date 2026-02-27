"""
Form Checker Module
Analyzes workout videos for proper form using MediaPipe Pose detection
and TensorFlow Lite for rep/form classification.
"""

import cv2
import numpy as np
import mediapipe as mp
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

# MediaPipe setup
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

# Common form issues by exercise
FORM_ISSUES = {
    'squat': {
        'knees_caving': 'Keep knees tracking over toes',
        'back_rounded': 'Maintain neutral spine, chest up',
        'heels_off_ground': 'Keep heels planted on ground',
        'incomplete_rom': 'Go deeper - break parallel',
    },
    'bench_press': {
        'back_arched': 'Reduce arch - keep shoulders on bench',
        'elbows_flared': 'Keep elbows at 45 degrees',
        'incomplete_rom': 'Lower bar to chest',
        'uneven_press': 'Press evenly - avoid one side higher',
    },
    'deadlift': {
        'back_rounded': 'Keep back straight - neutral spine',
        'rounded_shoulders': 'Engage shoulders - slight retraction',
        'knees_early': 'Extend legs and hips together',
        'bar_drift': 'Keep bar over midfoot throughout',
    },
    'rows': {
        'forward_lean': 'Minimize torso movement',
        'short_range': 'Full retraction - squeeze shoulder blades',
        'elbows_wide': 'Keep elbows closer to body',
    },
    'push_ups': {
        'hips_sagging': 'Keep body straight - engage core',
        'incomplete_rom': 'Lower chest to ground',
        'head_forward': 'Neutral neck - eyes down',
    },
}


class FormChecker:
    """Analyzes workout form using pose detection."""

    def __init__(self, confidence_threshold: float = 0.7):
        """
        Initialize form checker.

        Args:
            confidence_threshold: MediaPipe detection confidence (0-1)
        """
        self.confidence_threshold = confidence_threshold
        self.pose = None
        self.previous_positions = []

    def _get_landmarks(
        self, frame: np.ndarray, pose
    ) -> Optional[Dict[str, Tuple[float, float, float]]]:
        """
        Extract body landmarks from frame.

        Args:
            frame: Video frame (BGR)
            pose: MediaPipe Pose instance

        Returns:
            Dictionary of landmark positions or None if not detected
        """
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)

        if not results.pose_landmarks:
            return None

        landmarks = {}
        for landmark in results.pose_landmarks.landmark:
            if landmark.visibility > self.confidence_threshold:
                landmarks[landmark] = (
                    landmark.x,
                    landmark.y,
                    landmark.z,
                )

        return landmarks if landmarks else None

    def _calculate_angles(
        self, p1: Tuple[float, float, float],
        p2: Tuple[float, float, float],
        p3: Tuple[float, float, float],
    ) -> float:
        """
        Calculate angle between 3 points (in degrees).

        Args:
            p1, p2, p3: Points (x, y, z)

        Returns:
            Angle in degrees
        """
        # Convert 3D points to 2D for angle calculation
        v1 = np.array([p1[0] - p2[0], p1[1] - p2[1]])
        v2 = np.array([p3[0] - p2[0], p3[1] - p2[1]])

        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
        angle = np.arccos(np.clip(cos_angle, -1, 1))

        return np.degrees(angle)

    def _detect_squat_form(self, landmarks: Dict) -> Tuple[List[str], float]:
        """
        Analyze squat form from landmarks.

        Returns:
            (issues_found, form_score)
        """
        issues = []
        score = 100

        try:
            # Get key joints (using MediaPipe landmark indices)
            # Hip, knee, ankle for each side
            left_hip = landmarks.get(mp_pose.PoseLandmark.LEFT_HIP)
            left_knee = landmarks.get(mp_pose.PoseLandmark.LEFT_KNEE)
            left_ankle = landmarks.get(mp_pose.PoseLandmark.LEFT_ANKLE)

            right_hip = landmarks.get(mp_pose.PoseLandmark.RIGHT_HIP)
            right_knee = landmarks.get(mp_pose.PoseLandmark.RIGHT_KNEE)
            right_ankle = landmarks.get(mp_pose.PoseLandmark.RIGHT_ANKLE)

            if not all([left_hip, left_knee, left_ankle, right_hip, right_knee, right_ankle]):
                return [], 0

            # Check knee alignment (knees should track over ankles)
            left_knee_x = left_knee[0]
            left_ankle_x = left_ankle[0]
            right_knee_x = right_knee[0]
            right_ankle_x = right_ankle[0]

            left_knee_drift = abs(left_knee_x - left_ankle_x)
            right_knee_drift = abs(right_knee_x - right_ankle_x)

            if left_knee_drift > 0.15 or right_knee_drift > 0.15:
                issues.append('knees_caving')
                score -= 15

            # Check knee angle (should be ~90 degrees at bottom)
            left_knee_angle = self._calculate_angles(left_hip, left_knee, left_ankle)
            right_knee_angle = self._calculate_angles(right_hip, right_knee, right_ankle)

            avg_knee_angle = (left_knee_angle + right_knee_angle) / 2
            if avg_knee_angle > 100:  # Not deep enough
                issues.append('incomplete_rom')
                score -= 10

            # Check for heels off ground (ankle y-position relative to hip)
            if left_ankle[1] < left_hip[1] - 0.3 or right_ankle[1] < right_hip[1] - 0.3:
                # Frame-based check - would need more sophisticated logic
                pass

        except Exception as e:
            logger.error(f"Error analyzing squat form: {e}")

        return [FORM_ISSUES['squat'].get(issue, issue) for issue in issues], score

    def _detect_rep(self, current_landmarks: Dict, prev_landmarks: Optional[Dict]) -> str:
        """
        Detect if a full rep was completed.

        Args:
            current_landmarks: Current frame landmarks
            prev_landmarks: Previous frame landmarks

        Returns:
            "good_rep", "partial_rep", or "no_rep"
        """
        if not prev_landmarks:
            return 'no_rep'

        # Simple heuristic: check if major joints moved significantly
        # This is exercise-agnostic
        try:
            hip = mp_pose.PoseLandmark.LEFT_HIP
            knee = mp_pose.PoseLandmark.LEFT_KNEE

            if hip not in current_landmarks or knee not in current_landmarks:
                return 'no_rep'

            hip_movement = np.linalg.norm(
                np.array(current_landmarks[hip][:2]) -
                np.array(prev_landmarks.get(hip, [0, 0])[:2])
            )
            knee_movement = np.linalg.norm(
                np.array(current_landmarks[knee][:2]) -
                np.array(prev_landmarks.get(knee, [0, 0])[:2])
            )

            # If significant movement detected
            if hip_movement > 0.1 or knee_movement > 0.1:
                return 'good_rep'

        except Exception as e:
            logger.error(f"Error detecting rep: {e}")

        return 'no_rep'

    def analyze_video(
        self,
        video_path: str,
        exercise: str = 'squat',
    ) -> Dict:
        """
        Analyze workout video for form and rep count.

        Args:
            video_path: Path to video file
            exercise: Exercise type (squat, bench_press, deadlift, etc.)

        Returns:
            {
                'reps': int,
                'form_score': float (0-100),
                'issues': List[str],
                'frames_analyzed': int,
            }
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Could not open video: {video_path}")
            return {'reps': 0, 'form_score': 0, 'issues': [], 'frames_analyzed': 0}

        reps = 0
        all_issues = []
        form_scores = []
        frames_analyzed = 0
        prev_landmarks = None
        in_rep = False

        try:
            with mp_pose.Pose(
                min_detection_confidence=self.confidence_threshold,
                min_tracking_confidence=0.5,
            ) as pose:
                self.pose = pose

                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break

                    landmarks = self._get_landmarks(frame, pose)
                    if not landmarks:
                        prev_landmarks = None
                        continue

                    frames_analyzed += 1

                    # Analyze form based on exercise type
                    if exercise == 'squat':
                        issues, score = self._detect_squat_form(landmarks)
                        all_issues.extend(issues)
                        form_scores.append(score)

                    # Detect rep completion
                    rep_status = self._detect_rep(landmarks, prev_landmarks)
                    if rep_status == 'good_rep' and not in_rep:
                        reps += 1
                        in_rep = True
                    elif rep_status == 'no_rep':
                        in_rep = False

                    prev_landmarks = landmarks

        finally:
            cap.release()

        # Calculate final form score (average)
        final_form_score = (
            np.mean(form_scores) if form_scores else 0
        )

        # Remove duplicates while preserving order
        unique_issues = []
        seen = set()
        for issue in all_issues:
            if issue not in seen:
                unique_issues.append(issue)
                seen.add(issue)

        return {
            'reps': reps,
            'form_score': round(final_form_score, 1),
            'issues': unique_issues[:5],  # Top 5 issues
            'frames_analyzed': frames_analyzed,
        }


def analyze_workout_form(video_path: str, exercise: str = 'squat') -> Dict:
    """
    Convenience function to analyze a single workout video.

    Args:
        video_path: Path to video file
        exercise: Exercise type

    Returns:
        Analysis results dictionary
    """
    checker = FormChecker()
    return checker.analyze_video(video_path, exercise)
