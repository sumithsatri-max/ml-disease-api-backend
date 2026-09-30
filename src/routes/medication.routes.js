const express = require("express");

const router = express.Router();

const {
  searchDrugLabels,
  getDrugDetails
} = require("../services/openfda.service");

// Search medications
// GET /api/medications/search?name=metformin
router.get("/search", async (req, res, next) => {
  try {
    const name = String(req.query.name || "").trim();

    if (!name) {
      return res.status(400).json({
        error: "Query parameter 'name' is required"
      });
    }

    const data = await searchDrugLabels(
      name,
      req.query.limit
    );

    res.json({
      ...data,
      source: "openFDA",
      disclaimer:
        "Do not use this information to make individual treatment decisions."
    });
  } catch (error) {
    next(error);
  }
});

// Medication details
// GET /api/medications/metformin
router.get("/:name", async (req, res, next) => {
  try {
    const name = String(req.params.name || "").trim();

    if (!name) {
      return res.status(400).json({
        error: "Medication name is required"
      });
    }

    const medication = await getDrugDetails(name);

    res.json({
      medication,
      source: "openFDA",
      disclaimer:
        "This information is provided for educational and reference purposes only. Do not use it to make individual treatment decisions."
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        error: "Medication not found"
      });
    }

    next(error);
  }
});

module.exports = router;