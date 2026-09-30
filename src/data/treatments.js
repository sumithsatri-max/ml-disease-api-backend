/*
  IMPORTANT:
  This file intentionally contains a small demo catalog.
  For a real clinical product, replace/augment this with licensed or
  authoritative current guidelines and store source, version and date.
*/

const treatmentGuidelines = {
  D001: [{
    title: "Type 2 Diabetes - guideline placeholder",
    organization: "Configure an authoritative guideline source",
    version: "REPLACE_WITH_CURRENT_VERSION",
    recommendations: [
      "Lifestyle management and individualized glucose-lowering therapy should be considered according to current clinical guidance.",
      "Treatment selection depends on comorbidities, risks, patient preferences and clinical assessment."
    ],
    sourceUrl: "",
    status: "DEMO_PLACEHOLDER",
    evidenceNote: "Demo content only. Replace with a current authoritative guideline before clinical use."
  }],
  D002: [{
    title: "Hypertension - guideline placeholder",
    organization: "Configure an authoritative guideline source",
    version: "REPLACE_WITH_CURRENT_VERSION",
    recommendations: [
      "Confirm persistent hypertension with appropriate blood-pressure measurement.",
      "Use current guideline-based lifestyle and pharmacologic management according to the patient's clinical context."
    ],
    sourceUrl: "",
    status: "DEMO_PLACEHOLDER",
    evidenceNote: "Demo content only. Replace with a current authoritative guideline before clinical use."
  }],
  D003: [{
    title: "Asthma - guideline placeholder",
    organization: "Configure an authoritative guideline source",
    version: "REPLACE_WITH_CURRENT_VERSION",
    recommendations: [
      "Assess symptom control and exacerbation risk.",
      "Use an individualized asthma management plan based on current clinical guidance."
    ],
    sourceUrl: "",
    status: "DEMO_PLACEHOLDER",
    evidenceNote: "Demo content only. Replace with a current authoritative guideline before clinical use."
  }]
};

module.exports = { treatmentGuidelines };
