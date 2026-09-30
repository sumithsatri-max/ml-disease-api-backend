# ML Disease Detection Backend

Node.js + Express backend for:

1. Disease information
2. Treatment guideline records
3. Medication information
4. Clinical trials
5. Latest research studies
6. Medication-by-disease
7. ML prediction entry point

## 1. Install

```bash
npm install
```

## 2. Environment

Copy `.env.example` to `.env` and set:

```env
PORT=5000
NCBI_EMAIL=your-email@example.com
NCBI_TOOL=ml-disease-detection-app
NCBI_API_KEY=
OPENFDA_API_KEY=
CORS_ORIGIN=http://localhost:3000
```

The NCBI API key is optional for low-volume use. openFDA can be queried without a key, but a free key is recommended for regular use.

## 3. Run

```bash
npm run dev
```

or

```bash
npm start
```

Server:

http://localhost:5000

## Main endpoints

### Health

```http
GET /api/health
```

### Disease

```http
GET /api/diseases
GET /api/diseases?q=diabetes
GET /api/diseases/D001
```

### Treatment guidelines

```http
GET /api/diseases/D001/treatment-guidelines
```

### Medication by disease

```http
GET /api/diseases/D001/medications
```

### Medication search

```http
GET /api/medications/search?name=metformin
GET /api/medications/metformin
```

### Clinical trials

```http
GET /api/diseases/D001/clinical-trials
GET /api/clinical-trials/search?condition=diabetes
```

Optional:

```http
GET /api/clinical-trials/search?condition=diabetes&status=RECRUITING&limit=10
```

### Latest research

```http
GET /api/diseases/D001/latest-studies
GET /api/research/latest?disease=diabetes
```

### ML prediction

```http
POST /api/ml/predict
Content-Type: application/json
```

Example body:

```json
{
  "symptoms": [
    "increased thirst",
    "frequent urination",
    "fatigue"
  ]
}
```

## Architecture

```text
Frontend
   |
   v
Express API
   |
   +--> ML prediction service
   |
   +--> Disease catalog
   |
   +--> Treatment guideline catalog
   |
   +--> openFDA
   |
   +--> ClinicalTrials.gov API
   |
   +--> PubMed / NCBI E-utilities
```

## Production notes

- Replace the demo ML function with the real model inference service.
- Replace demo treatment data with current authoritative guidelines and retain source/version/update date.
- Add authentication/authorization before exposing protected patient functionality.
- Add persistent database storage if you need users, predictions, history or audit logs.
- Cache external API results to reduce latency and upstream traffic.
- Keep a clear distinction between an ML prediction and a confirmed clinical diagnosis.
- Review the terms, licensing and attribution requirements of each external data source before production use.
