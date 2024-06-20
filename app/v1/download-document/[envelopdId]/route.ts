import { NextResponse } from "next/server";
import { ApiClient, EnvelopesApi } from "docusign-esign";

const DOCUSIGN_API_BASE_PATH = process.env.DOCUSIGN_API_BASE_PATH;
const DOCUSIGN_INTEGRATOR_KEY = process.env.DOCUSIGN_INTEGRATOR_KEY;
const DOCUSIGN_USER_ID = process.env.DOCUSIGN_USER_ID;
const DOCUSIGN_PRIVATE_KEY = process.env.DOCUSIGN_PRIVATE_KEY;
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID;

async function getAccessToken() {
  const privateKey = DOCUSIGN_PRIVATE_KEY;
  const apiClient = new ApiClient();
  apiClient.setOAuthBasePath("account-d.docusign.com");

  const results = await apiClient.requestJWTUserToken(
    DOCUSIGN_INTEGRATOR_KEY as string,
    DOCUSIGN_USER_ID as string,
    ["signature"], // Changed this to an array of strings
    privateKey as any,
    3600
  );

  return results.body.access_token;
}

export async function GET(_: any, context: any) {
  const { envelopdId } = context.params;
  const apiClient = new ApiClient();
  apiClient.setBasePath(DOCUSIGN_API_BASE_PATH as string);
  apiClient.addDefaultHeader(
    "Authorization",
    "Bearer " + (await getAccessToken())
  );

  const envelopesApi = new EnvelopesApi(apiClient);

  try {
    // Download the entire envelope as a combined PDF document
    // ts-ignore
    const documentBuffer = await envelopesApi.getDocument(
      DOCUSIGN_ACCOUNT_ID as string,
      envelopdId,
      "combined",
      {}
    );

    return new NextResponse(documentBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="envelope_${envelopdId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error downloading document:", error.response?.data || error);
    return NextResponse.json(
      { error: "Failed to download document" },
      { status: 500 }
    );
  }
}
