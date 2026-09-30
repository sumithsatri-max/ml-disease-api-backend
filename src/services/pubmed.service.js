const axios = require("axios");

const BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

function getCommonParams() {
  return {
    db: "pubmed",
    retmode: "json",
    tool: process.env.NCBI_TOOL || "ml-disease-detection-app",
    email: process.env.NCBI_EMAIL || ""
  };
}

function extractDate(article) {
  const raw =
    article.pubdate ||
    article.epubdate ||
    article.sortpubdate ||
    "";

  const match = String(raw).match(/\d{4}(?:-\d{2}(?:-\d{2})?)?/);

  return match ? match[0] : null;
}

function isValidDate(dateString) {
  if (!dateString) return true;

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return true;
  }

  return date <= new Date();
}

async function searchPubMed(disease, limit = 10) {
  if (!disease) {
    throw new Error("Disease is required");
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    50
  );

  const searchParams = {
    ...getCommonParams(),
    term: `${disease}[Title/Abstract]`,
    retstart: 0,
    retmax: safeLimit,
    sort: "date"
  };

  if (process.env.NCBI_API_KEY) {
    searchParams.api_key = process.env.NCBI_API_KEY;
  }

  try {
    // --------------------------------
    // STEP 1: Search PubMed
    // --------------------------------
    const searchResponse = await axios.get(
      `${BASE_URL}/esearch.fcgi`,
      {
        params: searchParams,
        timeout: 15000
      }
    );

    const searchData = searchResponse.data;

    const ids =
      searchData?.esearchresult?.idlist || [];

    if (ids.length === 0) {
      return [];
    }

    // --------------------------------
    // STEP 2: Get article summaries
    // --------------------------------
    const summaryParams = {
      ...getCommonParams(),
      id: ids.join(",")
    };

    if (process.env.NCBI_API_KEY) {
      summaryParams.api_key = process.env.NCBI_API_KEY;
    }

    const summaryResponse = await axios.get(
      `${BASE_URL}/esummary.fcgi`,
      {
        params: summaryParams,
        timeout: 15000
      }
    );

    const summaryData = summaryResponse.data;

    const result = summaryData?.result || {};

    // --------------------------------
    // STEP 3: Format results
    // --------------------------------
    return ids
      .map((id) => {
        const article = result[id];

        if (!article || article.error) {
          return null;
        }

        const publicationDate =
          extractDate(article);

        if (
          publicationDate &&
          !isValidDate(publicationDate)
        ) {
          return null;
        }

        return {
          pmid: id,

          title:
            article.title || "",

          authors:
            Array.isArray(article.authors)
              ? article.authors
                  .map((author) => author.name)
                  .filter(Boolean)
              : [],

          journal:
            article.fulljournalname ||
            article.source ||
            "",

          publicationDate,

          url:
            `https://pubmed.ncbi.nlm.nih.gov/${id}/`,

          source: "PubMed"
        };
      })
      .filter(Boolean);

  } catch (error) {
    console.error(
      "PubMed API error:",
      error.response?.data ||
      error.message
    );

    throw new Error(
      `PubMed request failed: ${
        error.response?.status
          ? `HTTP ${error.response.status}`
          : error.message
      }`
    );
  }
}


// --------------------------------------------------
// Function expected by the routes
// --------------------------------------------------

async function latestStudies(disease, limit = 10) {
  return searchPubMed(disease, limit);
}


// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  latestStudies,
  searchPubMed
};