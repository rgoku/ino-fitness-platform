import math, sys
from pathlib import Path
import numpy as np

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

try:
    from detectors.fatigue_detector import FatigueDetector
    from detectors.imbalance_detector import ImbalanceDetector
    from detectors.injury_risk_detector import InjuryRiskDetector
    from coaching.progressive_overload import ProgressiveOverloadEngine, OverloadConfig
    from coaching.session_logger import SessionLogger
    from coaching.ai_coach import PersonalCoach, UserProfile
except ImportError:
    from fatigue_detector import FatigueDetector  # type: ignore[no-redef]
    from imbalance_detector import ImbalanceDetector  # type: ignore[no-redef]
    from injury_risk_detector import InjuryRiskDetector  # type: ignore[no-redef]
    from progressive_overload import ProgressiveOverloadEngine, OverloadConfig  # type: ignore[no-redef]
    from session_logger import SessionLogger  # type: ignore[no-redef]
    from ai_coach import PersonalCoach, UserProfile  # type: ignore[no-redef]

print("="*60); print("1) FATIGUE - a set taken to failure")
fd=FatigueDetector()
for i,(rom,tempo,form) in enumerate([(130,1.8,95),(128,1.9,94),(124,2.1,92),(118,2.4,88),(110,2.8,84),(100,3.5,78)],1):
    s=fd.update_rep(rom,tempo,form)
    print(f"  rep{i}: level {s.level:3d}  {s.status:13s} RIR {s.rir}  - {s.reason}")

print("="*60); print("2) IMBALANCE - left stronger than right")
im=ImbalanceDetector()
for _ in range(10): im.update_side("left",rom=125,velocity=60)
for _ in range(8):  im.update_side("right",rom=104,velocity=49)
im.set_reps(left=10,right=8)
r=im.report(); print(f"  rep diff {r.rep_diff}  ROM asym {r.rom_asym}  vel asym {r.vel_asym}")
print(f"  severity {r.severity}  weaker {r.weaker}\n  {r.note}")

print("="*60); print("3) INJURY RISK - synthetic squat w/ knee valgus + hip tilt")
class LM:
    def __init__(s,x,y,v=1.0): s.x,s.y,s.visibility=x,y,v
class LMS:
    def __init__(s,p): s.landmark=p
try:
    from core.angle_calculator import PoseLandmark as P
except ImportError:
    from angle_calculator import PoseLandmark as P  # type: ignore[no-redef]
pts=[LM(0.5,0.5) for _ in range(33)]
pts[P.LEFT_SHOULDER]=LM(0.42,0.30); pts[P.RIGHT_SHOULDER]=LM(0.58,0.305)
pts[P.LEFT_HIP]=LM(0.44,0.55);      pts[P.RIGHT_HIP]=LM(0.56,0.585)
pts[P.LEFT_KNEE]=LM(0.47,0.72);     pts[P.RIGHT_KNEE]=LM(0.53,0.72)
pts[P.LEFT_ANKLE]=LM(0.43,0.90);    pts[P.RIGHT_ANKLE]=LM(0.57,0.90)
pts[P.LEFT_EAR]=LM(0.45,0.26);      pts[P.RIGHT_EAR]=LM(0.55,0.26)
ir=InjuryRiskDetector(); flags=ir.process(LMS(pts),600,600)
for slug,d in flags.items(): print(f"  {slug:18s} {d['level']:5s} (v={d['value']})")
w=ir.worst(flags); print("  WORST ->", (w['slug'], w['level']) if w else "none")

print("="*60); print("4) SESSION LOGGER - capture + persist + read back")
import tempfile, pathlib
root=pathlib.Path(tempfile.mkdtemp())/"sessions"
log=SessionLogger(user="ruben", root=root); log.start_session()
for f in (94,92,90): log.log_rep("Barbell Curl", side="left", rom=120, tempo=2.0, form=f)
log.end_set("Barbell Curl", weight=15); p=log.save()
print("  saved:", p.name, "| sets:", len(log.sets), "reps:", len(log.reps))
print("  history:", SessionLogger.exercise_history("ruben","Barbell Curl",root=root))

print("="*60); print("5) PROGRESSIVE OVERLOAD - three scenarios")
eng=ProgressiveOverloadEngine(OverloadConfig(rep_low=8,rep_high=12))
hist_top=[{"weight":15,"sets":3,"reps":[12,12,12],"avg_form":93}]
hist_mid=[{"weight":15,"sets":3,"reps":[10,9,8],"avg_form":90}]
hist_dl =[{"weight":20,"sets":3,"reps":[10,10,9],"avg_form":82},
          {"weight":20,"sets":3,"reps":[9,8,8],"avg_form":80},
          {"weight":20,"sets":3,"reps":[8,7,6],"avg_form":78}]
for name,h in [("all top reps",hist_top),("mid-range",hist_mid),("declining",hist_dl)]:
    r=eng.recommend(h); print(f"  {name:14s}-> {r.action:11s} | {r.detail}")

print("="*60); print("6) AI COACH - readiness + auto prescription")
coach=PersonalCoach(user="ruben", profile=UserProfile(goal="hypertrophy", rep_range=(8,12)))
coach.update_recovery(sleep_h=7.5, soreness=2, nutrition=0.95)
brief=coach.daily_brief(exercises=["Barbell Curl"])
rd=brief["readiness"]; print(f"  readiness {rd['score']} ({rd['band']}) - {rd['advice']}")
for pl in brief["plan"]: print(f"  {pl['exercise']}: {pl['action']} - {pl['detail']}")
coach.update_recovery(sleep_h=5.2, soreness=4, nutrition=0.6)
rd=coach.readiness(); print(f"  poor recovery -> readiness {rd['score']} ({rd['band']}) - {rd['advice']}")
print("="*60); print("ALL MODULES RAN OK")
