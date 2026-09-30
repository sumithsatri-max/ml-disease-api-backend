const express = require("express");
const router = express.Router();

const { diseases, findDisease, searchDiseases } = require("../data/diseases");
const { treatmentGuidelines } = require("../data/treatments");
const { medicationsForDisease } = require("../services/medication.service");
const { searchClinicalTrials } = require("../services/clinicalTrials.service");
const { latestStudies } = require("../services/pubmed.service");

router.get("/", (req, res) => {
  const q = req.query.q;
  res.json({
    count: q ? searchDiseases(q).length : diseases.length,
    diseases: q ? searchDiseases(q) : diseases
  });
});

router.get("/:id", (req, res) => {
  const disease = findDisease(req.params.id);
  if (!disease) return res.status(404).json({ error: "Disease not found" });

  res.json({ disease });
});

router.get("/:id/treatment-guidelines", (req, res) => {
  const disease = findDisease(req.params.id);
  if (!disease) return res.status(404).json({ error: "Disease not found" });

  res.json({
    disease: disease.name,
    guidelines: treatmentGuidelines[disease.id] || [],
    disclaimer: "Verify against the current authoritative guideline before clinical use."
  });
});

router.get("/:id/medications", async (req, res, next) => {
  try {
    const disease = findDisease(req.params.id);
    if (!disease) return res.status(404).json({ error: "Disease not found" });

    const medications = await medicationsForDisease(disease.id);

    res.json({
      disease: disease.name,
      medications,
      disclaimer: "Medication information is educational and is not an individualized prescription."
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/clinical-trials", async (req, res, next) => {
  try {
    const disease = findDisease(req.params.id);
    if (!disease) return res.status(404).json({ error: "Disease not found" });

    const data = await searchClinicalTrials(disease.name, {
      limit: req.query.limit,
      status: req.query.status
    });

    res.json({
      disease: disease.name,
      ...data
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/latest-studies", async (req, res, next) => {
  try {
    const disease = findDisease(req.params.id);
    if (!disease) return res.status(404).json({ error: "Disease not found" });

    const studies = await latestStudies(disease.name, req.query.limit);

    res.json({
      disease: disease.name,
      studies,
      disclaimer: "Research summaries are not medical advice."
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
