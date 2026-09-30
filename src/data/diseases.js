const diseases = [
  {
    id: "D001",
    name: "Type 2 Diabetes",
    synonyms: ["Type 2 Diabetes Mellitus", "T2DM"],
    category: "Endocrine",
    description: "A chronic metabolic condition involving elevated blood glucose and impaired insulin action.",
    symptoms: ["increased thirst", "frequent urination", "fatigue", "blurred vision", "slow wound healing"],
    riskFactors: ["overweight or obesity", "family history", "physical inactivity", "increasing age"],
    complications: ["cardiovascular disease", "kidney disease", "neuropathy", "retinopathy"],
    diagnosis: ["blood glucose testing", "HbA1c", "oral glucose tolerance testing"],
    prevention: ["healthy diet", "regular physical activity", "weight management"],
    disclaimer: "This summary is educational and does not establish a diagnosis."
  },
  {
    id: "D002",
    name: "Hypertension",
    synonyms: ["High Blood Pressure"],
    category: "Cardiovascular",
    description: "A condition characterized by persistently elevated blood pressure.",
    symptoms: ["often no symptoms", "headache may occur", "dizziness may occur"],
    riskFactors: ["age", "family history", "high sodium intake", "physical inactivity", "obesity"],
    complications: ["stroke", "heart disease", "kidney disease"],
    diagnosis: ["repeated blood pressure measurements", "ambulatory blood pressure monitoring"],
    prevention: ["healthy diet", "physical activity", "weight management", "limiting sodium"],
    disclaimer: "This summary is educational and does not establish a diagnosis."
  },
  {
    id: "D003",
    name: "Asthma",
    synonyms: ["Bronchial Asthma"],
    category: "Respiratory",
    description: "A chronic respiratory condition involving variable airway inflammation and narrowing.",
    symptoms: ["wheezing", "shortness of breath", "chest tightness", "cough"],
    riskFactors: ["allergies", "family history", "air pollution", "smoke exposure"],
    complications: ["severe exacerbations", "respiratory distress"],
    diagnosis: ["clinical assessment", "spirometry", "bronchodilator testing"],
    prevention: ["trigger avoidance", "adherence to an individualized asthma plan"],
    disclaimer: "This summary is educational and does not establish a diagnosis."
  }
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function findDisease(idOrName) {
  const q = normalize(idOrName);
  return diseases.find(d =>
    normalize(d.id) === q ||
    normalize(d.name) === q ||
    d.synonyms.some(s => normalize(s) === q)
  );
}

function searchDiseases(q) {
  const term = normalize(q);
  return diseases.filter(d =>
    normalize(d.name).includes(term) ||
    normalize(d.category).includes(term) ||
    d.synonyms.some(s => normalize(s).includes(term))
  );
}

module.exports = { diseases, findDisease, searchDiseases };
