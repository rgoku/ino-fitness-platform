"""
integration_sim.py — drives the whole engine WITHOUT a camera.
Feeds synthetic full-body landmarks through every module exactly like
main_engine.py does, writes muscle_state.js, then validates the contract
the overlay consumes and confirms the coach reads the logged session.
"""
import json, math, time, pathlib
import numpy as np
from bicep_curl_detector import BicepCurlConfig, BicepCurlDetector
from injury_risk_detector import InjuryRiskDetector
from fatigue_detector import FatigueDetector
from imbalance_detector import ImbalanceDetector
from session_logger import SessionLogger
from ai_coach import PersonalCoach, UserProfile
from angle_calculator import PoseLandmark as P

class LM:
    def __init__(s,x,y,v=1.0): s.x,s.y,s.visibility=x,y,v
class LMS:
    def __init__(s,p): s.landmark=p

def pose(angle_deg):
    pts=[LM(0.5,0.5) for _ in range(33)]
    # arms: shoulder above elbow; wrist rotates to set elbow angle
    def wrist(ex,ey,th,flip): 
        r=math.radians(th); dx=0.16*math.sin(r)*(1 if not flip else -1); return (ex+dx, ey-0.16*math.cos(r))
    pts[P.LEFT_SHOULDER]=LM(0.40,0.30); pts[P.LEFT_ELBOW]=LM(0.40,0.48); pts[P.LEFT_WRIST]=LM(*wrist(0.40,0.48,angle_deg,False))
    pts[P.RIGHT_SHOULDER]=LM(0.60,0.30);pts[P.RIGHT_ELBOW]=LM(0.60,0.48);pts[P.RIGHT_WRIST]=LM(*wrist(0.60,0.48,angle_deg,True))
    # lower body w/ slight knee valgus so injury panel has data
    pts[P.LEFT_HIP]=LM(0.44,0.62); pts[P.RIGHT_HIP]=LM(0.56,0.62)
    pts[P.LEFT_KNEE]=LM(0.47,0.78);pts[P.RIGHT_KNEE]=LM(0.53,0.78)
    pts[P.LEFT_ANKLE]=LM(0.45,0.93);pts[P.RIGHT_ANKLE]=LM(0.55,0.93)
    pts[P.LEFT_EAR]=LM(0.42,0.26); pts[P.RIGHT_EAR]=LM(0.58,0.26)
    return LMS(pts)

STATE=pathlib.Path("muscle_state.js")
def write_state(d):
    STATE.write_text("window.__muscleState = "+json.dumps(d)+";",encoding="utf-8")

bicep=BicepCurlDetector(BicepCurlConfig()); injury=InjuryRiskDetector()
fatigue=FatigueDetector(); imbalance=ImbalanceDetector()
logger=SessionLogger(user="ruben"); logger.start_session()
frame=np.zeros((600,600,3),np.uint8); prev={"l":0,"r":0}
def vel(rom,t): return rom/t if (rom and t) else None

# 5 reps, getting slightly slower/shorter to trip fatigue
seq=[]
for rep in range(5):
    bottom=[40,40,42,46,52][rep]; step=[5,5,6,7,9][rep]
    seq+=[162]*10+list(range(160,bottom,-step))+[bottom]*10+list(range(bottom,160,step))+[162]*10

payload=None
for ang in seq:
    res=bicep.process_frame(frame, pose(ang), 600,600)
    for side,key in (("left","l"),("right","r")):
        reps=getattr(res,f"{side}_reps")
        if reps>prev[key]:
            rom=getattr(res,f"{side}_rom");tp=getattr(res,f"{side}_tempo");fm=getattr(res,f"{side}_score")
            fatigue.update_rep(rom,tp,fm,vel(rom,tp)); imbalance.update_side(side,rom=rom,velocity=vel(rom,tp))
            logger.log_rep("Barbell Curl",side=side,rom=rom,tempo=tp,form=fm,velocity=vel(rom,tp)); prev[key]=reps
    imbalance.set_reps(res.left_reps,res.right_reps)
    flags=injury.process(pose(ang),600,600); fat=fatigue.state(); imb=imbalance.report()
    import dataclasses
    payload={"left_reps":res.left_reps,"right_reps":res.right_reps,"left_angle":res.left_angle,"right_angle":res.right_angle,
      "left_form":res.left_form,"right_form":res.right_form,"left_score":res.left_score,"right_score":res.right_score,
      "overall":res.overall,"sub":res.sub,"left_rom":res.left_rom,"right_rom":res.right_rom,
      "left_tempo":res.left_tempo,"right_tempo":res.right_tempo,"cue":res.cue,
      "fatigue":{"level":fat.level,"status":fat.status,"rir":fat.rir,"reason":fat.reason},
      "imbalance":dataclasses.asdict(imb),"injury":flags,"injury_worst":InjuryRiskDetector.worst(flags)}
    write_state(payload); time.sleep(0.01)
logger.end_set("Barbell Curl",weight=15); sp=logger.save()

# ---- validate the contract the overlay reads ----
raw=STATE.read_text(); js=json.loads(raw.split("=",1)[1].strip().rstrip(";"))
need=["left_reps","right_reps","overall","sub","cue","fatigue","injury","imbalance"]
missing=[k for k in need if k not in js]
print("muscle_state.js valid JSON:", True, "| missing keys:", missing or "none")
print("reps L/R:",js["left_reps"],"/",js["right_reps"],"| overall",js["overall"],"| cue:",js["cue"])
print("fatigue:",js["fatigue"]["status"],"lvl",js["fatigue"]["level"],"RIR",js["fatigue"]["rir"])
print("injury flags:",{k:v["level"] for k,v in js["injury"].items()})
print("imbalance:",js["imbalance"]["severity"],"weaker",js["imbalance"]["weaker"])
print("session saved:",sp.name)

# ---- coach reads the freshly logged session ----
coach=PersonalCoach(user="ruben",profile=UserProfile(rep_range=(8,12)))
coach.update_recovery(sleep_h=7.5,soreness=2,nutrition=0.95)
plan=coach.daily_brief(["Barbell Curl"])
print("coach readiness:",plan["readiness"]["score"],plan["readiness"]["band"])
print("coach plan:",plan["plan"][0]["action"],"-",plan["plan"][0]["detail"],"(from",plan["plan"][0]["history_sessions"],"sessions)")
assert not missing, "overlay contract incomplete"
print("\nINTEGRATION OK — full pipeline produced a valid state file the overlay consumes.")
