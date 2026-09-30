const axios = require("axios");

const BASE_URL = "https://clinicaltrials.gov/api/v2/studies";

function clean(value) {
  return value == null ? null : String(value).trim();
}

function mapCompactStudy(study) {
  const p = study.protocolSection || {};
  const id = p.identificationModule || {};
  const status = p.statusModule || {};
  const design = p.designModule || {};
  const sponsor = p.sponsorCollaboratorsModule || {};

  return {
    nctId: clean(id.nctId),
    title: clean(id.briefTitle),
    officialTitle: clean(id.officialTitle),
    status: clean(status.overallStatus),
    startDate: clean(status.startDateStruct?.date),
    completionDate: clean(status.completionDateStruct?.date),
    phase: Array.isArray(design.phases)
      ? design.phases
      : [],
    studyType: clean(design.studyType),
    sponsor: clean(sponsor.leadSponsor?.name),
    source: "ClinicalTrials.gov"
  };
}

function mapDetailedStudy(study) {
  const p = study.protocolSection || {};
  const id = p.identificationModule || {};
  const status = p.statusModule || {};
  const design = p.designModule || {};
  const sponsor = p.sponsorCollaboratorsModule || {};

  const interventions =
    p.armsInterventionsModule?.interventions || [];

  const eligibility =
    p.eligibilityModule || {};

  const contacts =
    p.contactsLocationsModule || {};

  return {
    nctId: clean(id.nctId),

    title: clean(id.briefTitle),

    officialTitle: clean(id.officialTitle),

    status: clean(status.overallStatus),

    startDate:
      clean(status.startDateStruct?.date),

    completionDate:
      clean(status.completionDateStruct?.date),

    phase:
      Array.isArray(design.phases)
        ? design.phases
        : [],

    studyType:
      clean(design.studyType),

    sponsor:
      clean(sponsor.leadSponsor?.name),

    interventions:
      interventions.map((i) => ({
        name: clean(i.name),
        type: clean(i.type),
        description: clean(i.description)
      })),

    eligibility: {
      criteria:
        clean(eligibility.eligibilityCriteria),

      minimumAge:
        clean(eligibility.minimumAge),

      maximumAge:
        clean(eligibility.maximumAge),

      sex:
        clean(eligibility.sex),

      healthyVolunteers:
        eligibility.healthyVolunteers ?? null
    },

    locations:
      (contacts.locations || [])
        .map((l) => ({
          facility: clean(l.facility),
          city: clean(l.city),
          state: clean(l.state),
          country: clean(l.country),
          status: clean(l.status)
        }))
        .filter(
          (l) =>
            l.facility ||
            l.city ||
            l.state ||
            l.country
        ),

    source: "ClinicalTrials.gov"
  };
}

async function searchClinicalTrials(
  condition,
  options = {}
) {
  if (
    !condition ||
    !String(condition).trim()
  ) {
    throw new Error("Condition is required");
  }

  const limit = Math.min(
    Math.max(
      Number(options.limit) || 10,
      1
    ),
    100
  );

  const params = {
    "query.cond":
      String(condition).trim(),

    pageSize: limit,

    format: "json"
  };

  if (options.status) {
    params["filter.overallStatus"] =
      String(options.status).trim();
  }

  if (options.pageToken) {
    params.pageToken =
      String(options.pageToken).trim();
  }

  const response = await axios.get(
    BASE_URL,
    {
      params,
      timeout: 20000
    }
  );

  const studies =
    response.data?.studies || [];

  return {
    totalReturned:
      studies.length,

    nextPageToken:
      response.data?.nextPageToken || null,

    studies:
      studies.map(mapCompactStudy)
  };
}

async function getClinicalTrialById(
  nctId
) {
  const id =
    String(nctId || "")
      .trim()
      .toUpperCase();

  if (!id) {
    throw new Error(
      "NCT ID is required"
    );
  }

  if (!/^NCT\d+$/.test(id)) {
    const error = new Error(
      "Invalid NCT ID. Example: NCT07060456"
    );

    error.statusCode = 400;

    throw error;
  }

  const response = await axios.get(
    `${BASE_URL}/${encodeURIComponent(id)}`,
    {
      params: {
        format: "json"
      },

      timeout: 20000
    }
  );

  return mapDetailedStudy(
    response.data
  );
}

module.exports = {
  searchClinicalTrials,
  getClinicalTrialById
};