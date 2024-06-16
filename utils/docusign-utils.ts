const {
  ApiClient,
  EnvelopesApi,
  EnvelopeDefinition,
  Document,
  Signer,
  SignHere,
  Tabs,
  Recipients,
} = require("docusign-esign");
const { PDFDocument } = require("pdf-lib");

const DOCUSIGN_INTEGRATOR_KEY = process.env.DOCUSIGN_INTEGRATOR_KEY;
const DOCUSIGN_USER_ID = process.env.DOCUSIGN_USER_ID;
const DOCUSIGN_API_BASE_PATH = process.env.DOCUSIGN_API_BASE_PATH; // Ensure this is correct
const DOCUSIGN_PRIVATE_KEY = process.env.DOCUSIGN_PRIVATE_KEY;
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID;
const DOCUSIGN_SIGNER_EMAIL = process.env.DOCUSIGN_SIGNER_EMAIL;
const DOCUSIGN_SIGNER_NAME = process.env.DOCUSIGN_SIGNER_NAME;

export async function sendToDocuSign(pdfBytes: Buffer, email: string) {
  const apiClient = new ApiClient();
  apiClient.setBasePath(`${DOCUSIGN_API_BASE_PATH}`);
  apiClient.addDefaultHeader(
    "Authorization",
    "Bearer " + (await getAccessToken())
  );

  // Parse the PDF to get the number of pages
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  const envDef = new EnvelopeDefinition();
  envDef.emailSubject = "Please sign this document";
  envDef.status = "sent";

  const doc = new Document();
  doc.documentBase64 = Buffer.from(pdfBytes).toString("base64");
  doc.name = "Merged Invoice";
  doc.fileExtension = "pdf";
  doc.documentId = "1";

  envDef.documents = [doc];

  const signer = new Signer();
  signer.email = email;
  signer.name = DOCUSIGN_SIGNER_NAME;
  signer.recipientId = "1";

  // Create SignHere tabs for each page
  const signHereTabs = [];
  for (let i = 1; i <= totalPages; i++) {
    const signHere = new SignHere();
    signHere.documentId = "1";
    signHere.pageNumber = i.toString();
    signHere.recipientId = "1";
    signHere.tabLabel = "SignHereTab";
    signHere.xPosition = "100"; // Customize the position as needed
    signHere.yPosition = "700"; // Customize the position as needed
    signHereTabs.push(signHere);
  }

  const tabs = new Tabs();
  tabs.signHereTabs = signHereTabs;
  signer.tabs = tabs;

  envDef.recipients = new Recipients();
  envDef.recipients.signers = [signer];

  const envelopesApi = new EnvelopesApi(apiClient);
  try {
    const results = await envelopesApi.createEnvelope(DOCUSIGN_ACCOUNT_ID, {
      envelopeDefinition: envDef,
    });
    return results;
  } catch (error: any) {
    console.error(
      "Error sending document to DocuSign:",
      error.response?.data || error
    );
    throw error;
  }
}

async function getAccessToken() {
  const privateKey = DOCUSIGN_PRIVATE_KEY;
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

export { getAccessToken };
