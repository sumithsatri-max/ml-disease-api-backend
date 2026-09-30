import os,sys,json,joblib,pandas as pd
BASE=os.path.dirname(os.path.abspath(__file__))
a=joblib.load(os.path.join(BASE,"model","disease_model.pkl"))
model=a["model"]; features=a["features"]; names=a["disease_names"]
ALIASES={
"thirst":"increased_thirst","increased thirst":"increased_thirst",
"frequent urination":"frequent_urination","high blood sugar":"high_blood_sugar","hba1c":"high_blood_sugar",
"fatigue":"fatigue","tiredness":"fatigue","blurred vision":"blurred_vision","weight loss":"weight_loss",
"increased hunger":"increased_hunger","slow healing":"slow_healing","tingling":"tingling_hands_feet",
"high blood pressure":"high_blood_pressure","blood pressure":"high_blood_pressure","high bp":"high_blood_pressure",
"hypertension":"high_blood_pressure","headache":"headache","dizziness":"dizziness","chest pain":"chest_discomfort",
"chest discomfort":"chest_discomfort","shortness of breath":"shortness_of_breath","breathlessness":"shortness_of_breath",
"nosebleed":"nosebleed","palpitations":"palpitations","wheezing":"wheezing","asthma":"wheezing","cough":"cough",
"night symptoms":"night_symptoms","exercise triggered":"exercise_triggered","difficulty breathing":"difficulty_breathing",
"chest tightness":"chest_tightness"
}
raw=sys.stdin.read().strip()
p=json.loads(raw)
vals=p.get("symptoms",[]) if isinstance(p,dict) else p
text=" ".join(map(str,vals)).lower() if isinstance(vals,list) else str(vals).lower()
x={f:0 for f in features}; matched=[]
for phrase,feature in sorted(ALIASES.items(),key=lambda z:-len(z[0])):
    if phrase in text and feature in x:
        x[feature]=1
        if feature not in matched: matched.append(feature)
if not matched:
    print(json.dumps({"diseaseId":None,"disease":None,"confidence":0,"matchedSymptoms":[]}))
    sys.exit()
X=pd.DataFrame([x]); probs=model.predict_proba(X)[0]; i=probs.argmax()
did=str(model.classes_[i]); conf=float(probs[i])
if conf<.45: did=None
print(json.dumps({"diseaseId":did,"disease":names.get(did) if did else None,"confidence":round(conf,2),"matchedSymptoms":matched}))
