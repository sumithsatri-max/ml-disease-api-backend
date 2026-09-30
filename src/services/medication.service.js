const { searchDrugLabels } = require("./openfda.service");

/*
  Disease -> medication is deliberately not hard-coded as a prescription.
  It returns medication information only when your application has mapped
  a disease to a medication search term. Replace this catalog with
  guideline-backed mappings for production.
*/

const diseaseMedicationMap = {
  D001: ["metformin", "semaglutide"],
  D002: ["amlodipine", "losartan"],
  D003: ["albuterol"]
};

function clean(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function unique(values = []) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function firstNonEmpty(values = []) {
  return values.map(clean).find(Boolean) || "";
}

function aggregateMedicationRecords(records, requestedName) {
  const groups = new Map();

  for (const record of records) {
    const genericNames = unique(record.genericNames);
    const normalizedGeneric = genericNames.join("|").toLowerCase();
    const key = normalizedGeneric || clean(requestedName).toLowerCase();

    if (!groups.has(key)) {
      groups.set(key, {
        name: clean(requestedName),
        genericName: firstNonEmpty(genericNames) || clean(requestedName),
        brandNames: [],
        routes: [],
        source: "openFDA"
      });
    }

    const group = groups.get(key);
    group.brandNames.push(...unique(record.brandNames));
    group.routes.push(...unique(record.route));
  }

  return [...groups.values()].map(group => ({
    name: group.name,
    genericName: group.genericName,
    brandNames: unique(group.brandNames),
    route: firstNonEmpty(group.routes),
    source: group.source
  }));
}

async function medicationsForDisease(diseaseId) {
  const names = diseaseMedicationMap[diseaseId] || [];

  const results = await Promise.allSettled(
    names.map(name => searchDrugLabels(name, 10))
  );

  return results.flatMap((result, index) => {
    const requestedName = names[index];

    if (result.status !== "fulfilled") {
      return [{
        name: requestedName,
        genericName: requestedName,
        brandNames: [],
        route: "",
        source: "openFDA",
        error: "Drug data unavailable"
      }];
    }

    return aggregateMedicationRecords(result.value, requestedName);
  });
}

module.exports = { medicationsForDisease };
