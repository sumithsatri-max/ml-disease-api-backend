require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const diseaseRoutes = require("./routes/disease.routes");
const medicationRoutes = require("./routes/medication.routes");
const clinicalTrialRoutes = require("./routes/clinicalTrial.routes");
const researchRoutes = require("./routes/research.routes");
const mlRoutes = require("./routes/ml.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"
}));
app.use(express.json({ limit: "5mb" }));

app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/", (req, res) => {
  res.json({
    name: process.env.APP_NAME || "ML Disease Detection API",
    version: "1.0.0",
    status: "running",
    disclaimer: "For educational/research use. ML output is not a confirmed diagnosis and API data is not a substitute for professional medical care."
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/diseases", diseaseRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/clinical-trials", clinicalTrialRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/ml", mlRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`ML Disease API running on http://localhost:${PORT}`);
});
