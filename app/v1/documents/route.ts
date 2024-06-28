const { ApiClient, EnvelopesApi } = require("docusign-esign");
import { NextResponse } from "next/server";

const DOCUSIGN_API_BASE_PATH = process.env.DOCUSIGN_API_BASE_PATH;
const DOCUSIGN_INTEGRATOR_KEY = process.env.DOCUSIGN_INTEGRATOR_KEY;
const DOCUSIGN_USER_ID = process.env.DOCUSIGN_USER_ID;
const DOCUSIGN_PRIVATE_KEY = process.env.DOCUSIGN_PRIVATE_KEY;
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID;

async function getAccessToken() {
  let privateKey = DOCUSIGN_PRIVATE_KEY!;
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }
  const apiClient = new ApiClient();
  apiClient.setOAuthBasePath("account-d.docusign.com");

  const results = await apiClient.requestJWTUserToken(
    DOCUSIGN_INTEGRATOR_KEY,
    DOCUSIGN_USER_ID,
    "signature",
    privateKey,
    3600
  );

  return results.body.access_token;
}

export async function GET() {
  const apiClient = new ApiClient();
  apiClient.setBasePath(`${DOCUSIGN_API_BASE_PATH}`);
  apiClient.addDefaultHeader(
    "Authorization",
    "Bearer " + (await getAccessToken())
  );

  const envelopesApi = new EnvelopesApi(apiClient);

  try {
    const results = await envelopesApi.listStatusChanges(DOCUSIGN_ACCOUNT_ID, {
      fromDate: "2024-06-26", // Adjust the date as needed
    });

    return NextResponse.json({ envelopes: results.envelopes });
  } catch (error: any) {
    console.error(
      "Error fetching document status:",
      error.response?.data || error
    );
    return NextResponse.json(
      { error: "Failed to fetch document status" },
      { status: 500 }
    );
  }
}
