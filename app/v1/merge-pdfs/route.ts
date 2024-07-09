import { NextResponse } from "next/server";
import { mergePdfs } from "@/utils/pdf-utils";
import { sendToDocuSign } from "@/utils/docusign-utils";
import { createClient } from "@/utils/supabase/server";
const { ApiClient, EnvelopesApi } = require("docusign-esign");
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DOCUSIGN_API_BASE_PATH = process.env.DOCUSIGN_API_BASE_PATH;
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID;
const DOCUSIGN_SIGNER_NAME = process.env.DOCUSIGN_SIGNER_NAME;
const DOCUSIGN_INTEGRATOR_KEY = process.env.DOCUSIGN_INTEGRATOR_KEY;
const DOCUSIGN_USER_ID = process.env.DOCUSIGN_USER_ID;

async function getAccessToken() {
  const privateKey = process.env.DOCUSIGN_PRIVATE_KEY!.replace(/\\n/g, "\n");
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

async function getEmbeddedSigningUrl(
  envelopeId: string,
  recipientEmail: string
) {
  const apiClient = new ApiClient();
  apiClient.setBasePath(DOCUSIGN_API_BASE_PATH);
  apiClient.addDefaultHeader(
    "Authorization",
    "Bearer " + (await getAccessToken())
  );

  const envelopesApi = new EnvelopesApi(apiClient);

  const viewRequest = {
    returnUrl: `${defaultUrl}/payment?${envelopeId}`, // URL to redirect after signing
    authenticationMethod: "none",
    email: recipientEmail,
    userName: DOCUSIGN_SIGNER_NAME,
    clientUserId: "1000", // Must match the clientUserId used when creating the envelope
  };

  try {
    const recipientView = await envelopesApi.createRecipientView(
      DOCUSIGN_ACCOUNT_ID,
      envelopeId,
      { recipientViewRequest: viewRequest }
    );

    console.log("Recipient View URL:", recipientView.url);
    return recipientView.url;
  } catch (error: any) {
    console.error(
      "Error creating recipient view:",
      error.response?.data || error
    );
    throw error;
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const invoiceDetails = JSON.parse(formData.get("invoiceDetails") as string);
  const files = formData.getAll("files") as Blob[];

  const fileBlobs = files.map((file) => file);

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    // Merging the PDFs
    const mergedPdfBytes = await mergePdfs(fileBlobs, null);
    // Send the merged PDF to DocuSign for signature
    const envelopeId = await sendToDocuSign(
      invoiceDetails,
      user?.email as string,
      mergedPdfBytes as Buffer
    );

    console.log(user?.email, "user?.email");
    const signingUrl = await getEmbeddedSigningUrl(
      envelopeId,
      user?.email as string
    );
    return NextResponse.json({ signingUrl });
  } catch (error: any) {
    console.error("Error merging PDFs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
