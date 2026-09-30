import os, joblib, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

BASE=os.path.dirname(os.path.abspath(__file__))
df=pd.read_csv(os.path.join(BASE,"dataset","dataset.csv"))
features=[c for c in df.columns if c not in ["disease_id","disease"]]
X=df[features]; y=df["disease_id"]
Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=.2,random_state=42,stratify=y)
model=RandomForestClassifier(n_estimators=200,random_state=42,class_weight="balanced")
model.fit(Xtr,ytr)
pred=model.predict(Xte)
acc=accuracy_score(yte,pred)
os.makedirs(os.path.join(BASE,"model"),exist_ok=True)
joblib.dump({"model":model,"features":features,"disease_names":{
"D001":"Type 2 Diabetes","D002":"Hypertension","D003":"Asthma"
}},os.path.join(BASE,"model","disease_model.pkl"))
print("TRAINING COMPLETE")
print("Rows:",len(df))
print("Features:",len(features))
print("Test accuracy:",round(acc,4))
print(classification_report(yte,pred))
