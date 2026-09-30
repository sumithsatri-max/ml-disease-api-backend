const express = require("express");
const router = express.Router();
const { latestStudies } = require("../services/pubmed.service");

router.get("/latest", async (req, res, next) => {
  try {
    const disease = String(req.query.disease || "").trim();
    if (!disease) {
      return res.status(400).json({ error: "Query parameter 'disease' is required" });
    }

    const studies = await latestStudies(disease, req.query.limit);

    res.json({
      disease,
      count: studies.length,
      studies,
      source: "PubMed"
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
