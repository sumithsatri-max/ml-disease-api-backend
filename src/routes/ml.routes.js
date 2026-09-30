const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const router = express.Router();

const { findDisease } = require("../data/diseases");

const PYTHON_CMD =
  process.env.PYTHON_CMD ||
  (process.platform === "win32" ? "python" : "python3");

const PYTHON_SCRIPT = path.join(
  __dirname,
  "../../ml-disease-ml/ml-disease-ml/predict.py"
);

function runPythonPrediction(input) {
  return new Promise((resolve, reject) => {
    const python = spawn(
      PYTHON_CMD,
      [PYTHON_SCRIPT],
      {
        cwd: path.dirname(PYTHON_SCRIPT)
      }
    );

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("error", (error) => {
      reject(
        new Error(
          `Failed to start Python: ${error.message}`
        )
      );
    });

    python.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `Python prediction failed: ${
              stderr || `Exit code ${code}`
            }`
          )
        );
      }

      try {
        const result = JSON.parse(
          stdout.trim()
        );

        resolve(result);
      } catch (error) {
        reject(
          new Error(
            `Invalid Python response: ${stdout}`
          )
        );
      }
    });

    python.stdin.write(
      JSON.stringify(input)
    );

    python.stdin.end();
  });
}

router.post("/predict", async (req, res, next) => {
  try {
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body) ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        error: "Prediction input is required",

        example: {
          symptoms: [
            "increased thirst",
            "frequent urination"
          ]
        }
      });
    }

    const prediction =
      await runPythonPrediction(req.body);

    const disease =
      prediction.diseaseId
        ? findDisease(
            prediction.diseaseId
          )
        : null;

    res.json({
      model: {
        type: "random-forest",
        status: "DEMO",
        trainingData: "Synthetic dataset",
        features: 22
      },

      prediction: {
        diseaseId:
          prediction.diseaseId || null,

        disease:
          disease?.name ||
          prediction.disease ||
          null,

        confidence:
          Number(
            prediction.confidence || 0
          ),

        matchedSymptoms:
          prediction.matchedSymptoms || []
      },

      nextStep: disease
        ? `/api/diseases/${disease.id}`
        : null,

      disclaimer:
        "This model was trained on synthetic demonstration data. Its output is not a confirmed diagnosis and must not be used for medical decisions."
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;