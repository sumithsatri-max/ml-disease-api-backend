const express = require("express");

const router = express.Router();

const {
  searchClinicalTrials,
  getClinicalTrialById
} = require("../services/clinicalTrials.service");


// ==========================================
// SEARCH CLINICAL TRIALS
// ==========================================

router.get("/search", async (req, res, next) => {
  try {
    const condition =
      String(
        req.query.condition || ""
      ).trim();

    if (!condition) {
      return res.status(400).json({
        error:
          "Query parameter 'condition' is required"
      });
    }

    const data =
      await searchClinicalTrials(
        condition,
        {
          limit: req.query.limit,
          status: req.query.status,
          pageToken:
            req.query.pageToken
        }
      );

    res.json({
      condition,
      ...data
    });

  } catch (err) {
    next(err);
  }
});


// ==========================================
// GET SINGLE CLINICAL TRIAL
// ==========================================

router.get(
  "/:nctId",
  async (req, res, next) => {
    try {
      const study =
        await getClinicalTrialById(
          req.params.nctId
        );

      res.json({
        study
      });

    } catch (err) {

      if (
        err.response?.status === 404
      ) {
        return res.status(404).json({
          error:
            "Clinical trial not found"
        });
      }

      if (err.statusCode) {
        return res
          .status(err.statusCode)
          .json({
            error: err.message
          });
      }

      next(err);
    }
  }
);


module.exports = router;