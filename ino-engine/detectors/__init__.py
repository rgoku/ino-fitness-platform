"""
ino-engine.detectors
--------------------
Exercise-specific detectors, fatigue tracking, injury screening, and
left/right imbalance analysis.
"""
from .bicep_curl_detector import BicepCurlDetector, BicepCurlConfig   # noqa: F401
from .fatigue_detector import FatigueDetector                          # noqa: F401
from .injury_risk_detector import InjuryRiskDetector                   # noqa: F401
from .imbalance_detector import ImbalanceDetector                      # noqa: F401
