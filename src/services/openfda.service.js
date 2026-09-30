const axios = require("axios");

const BASE_URL = "https://api.fda.gov/drug/label.json";

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function unique(values = []) {
  return [
    ...new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  ];
}

function flatten(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap(flatten);
  }

  return [value];
}

function first(value) {
  const values = flatten(value);
  return values.length > 0 ? values[0] : null;
}

function isExactSingleIngredient(
  requestedName,
  genericNames = []
) {
  const requested = normalize(requestedName);

  if (!requested) return false;

  const allowed = new Set([
    requested,
    `${requested} hydrochloride`,
    `${requested} sodium`,
    `${requested} sulfate`,
    `${requested} fumarate`,
    `${requested} acetate`,
    `${requested} tartrate`,
    `${requested} potassium`,
    `${requested} calcium`
  ]);

  return genericNames.some((generic) =>
    allowed.has(normalize(generic))
  );
}

function getPrimaryGenericName(
  requestedName,
  genericNames = []
) {
  return (
    genericNames.find((generic) =>
      isExactSingleIngredient(
        requestedName,
        [generic]
      )
    ) || null
  );
}

/*
 * Fetch FDA labels
 */
async function fetchDrugLabels(
  drugName,
  limit = 20
) {
  if (!drugName || !String(drugName).trim()) {
    throw new Error("Drug name is required");
  }

  const requestedName =
    String(drugName).trim();

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const params = {
    search: `openfda.generic_name:"${requestedName}"`,
    limit: safeLimit
  };

  if (process.env.OPENFDA_API_KEY) {
    params.api_key =
      process.env.OPENFDA_API_KEY;
  }

  try {
    const response = await axios.get(
      BASE_URL,
      {
        params,
        timeout: 20000
      }
    );

    const results =
      response.data?.results || [];

    /*
     * Remove combination medications.
     */
    return results.filter((label) => {
      const genericNames =
        flatten(
          label.openfda?.generic_name
        );

      return isExactSingleIngredient(
        requestedName,
        genericNames
      );
    });
  } catch (error) {
    console.error(
      "openFDA API error:",
      error.response?.data ||
        error.message
    );

    if (error.response?.status === 404) {
      return [];
    }

    throw new Error(
      `openFDA request failed: ${
        error.response?.status
          ? `HTTP ${error.response.status}`
          : error.message
      }`
    );
  }
}

/*
 * =========================================================
 * COMPACT MEDICATION SEARCH
 * =========================================================
 *
 * GET:
 * /api/medications/search?name=metformin
 *
 * Returns only summary information.
 */
async function searchDrugLabels(
  drugName,
  limit = 20
) {
  const requestedName =
    String(drugName || "").trim();

  if (!requestedName) {
    throw new Error(
      "Drug name is required"
    );
  }

  const labels =
    await fetchDrugLabels(
      requestedName,
      limit
    );

  /*
   * Group labels by generic ingredient.
   */
  const groups = new Map();

  for (const label of labels) {
    const genericNames =
      flatten(
        label.openfda?.generic_name
      );

    const genericName =
      getPrimaryGenericName(
        requestedName,
        genericNames
      );

    if (!genericName) continue;

    const key =
      normalize(genericName);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(label);
  }

  const medications =
    Array.from(groups.values()).map(
      (group) => {
        const genericNames = unique(
          group.flatMap((label) =>
            flatten(
              label.openfda?.generic_name
            )
          )
        );

        const brandNames = unique(
          group.flatMap((label) =>
            flatten(
              label.openfda?.brand_name
            )
          )
        );

        const manufacturers = unique(
          group.flatMap((label) =>
            flatten(
              label.openfda?.manufacturer_name
            )
          )
        );

        const routes = unique(
          group.flatMap((label) =>
            flatten(
              label.openfda?.route
            )
          )
        );

        return {
          name:
            requestedName
              .replace(/\b\w/g, (char) =>
                char.toUpperCase()
              ),

          genericName:
            genericNames[0] || null,

          brandNames,

          manufacturers,

          routes,

          source: "openFDA"
        };
      }
    );

  return {
    query: requestedName,
    count: medications.length,
    medications
  };
}

/*
 * =========================================================
 * MEDICATION DETAILS
 * =========================================================
 *
 * GET:
 * /api/medications/metformin
 *
 * IMPORTANT:
 * We intentionally use ONE representative FDA label.
 * We do NOT merge dozens of FDA labels together.
 *
 * This keeps the response useful and reasonably sized.
 */
async function getDrugDetails(
  drugName
) {
  const requestedName =
    String(drugName || "").trim();

  if (!requestedName) {
    throw new Error(
      "Drug name is required"
    );
  }

  const labels =
    await fetchDrugLabels(
      requestedName,
      10
    );

  if (labels.length === 0) {
    const error =
      new Error(
        "Medication not found"
      );

    error.statusCode = 404;

    throw error;
  }

  /*
   * Select ONE representative FDA label.
   */
  const label = labels[0];

  const openfda =
    label.openfda || {};

  return {
    name:
      requestedName
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),

    genericName:
      first(
        openfda.generic_name
      ),

    brandNames:
      unique(
        flatten(
          openfda.brand_name
        )
      ).slice(0, 10),

    manufacturer:
      first(
        openfda.manufacturer_name
      ),

    route:
      first(
        openfda.route
      ),

    indications:
      first(
        label.indications_and_usage
      ),

    warnings:
      first(
        label.warnings
      ),

    contraindications:
      first(
        label.contraindications
      ),

    adverseReactions:
      first(
        label.adverse_reactions
      ),

    source: "openFDA"
  };
}

module.exports = {
  searchDrugLabels,
  getDrugDetails
};