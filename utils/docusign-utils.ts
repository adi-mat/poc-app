const {
  ApiClient,
  EnvelopesApi,
  EnvelopeDefinition,
  TemplateRole,
  Text,
  Tabs,
  Document,
  SignHere,
  Signer,
  Recipients,
  CompositeTemplate,
  ServerTemplate,
  InlineTemplate,
} = require("docusign-esign");
const { PDFDocument } = require("pdf-lib");

const DOCUSIGN_INTEGRATOR_KEY = process.env.DOCUSIGN_INTEGRATOR_KEY;
const DOCUSIGN_USER_ID = process.env.DOCUSIGN_USER_ID;
const DOCUSIGN_API_BASE_PATH = process.env.DOCUSIGN_API_BASE_PATH;
const DOCUSIGN_PRIVATE_KEY = process.env.DOCUSIGN_PRIVATE_KEY;
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID;
const DOCUSIGN_TEMPLATE_ID = process.env.DOCUSIGN_TEMPLATE_ID;
const DOCUSIGN_SIGNER_NAME = process.env.DOCUSIGN_SIGNER_NAME;

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

export async function sendToDocuSign(
  invoiceDetails: any,
  email: string,
  additionalPdfBytes: Buffer
) {
  const apiClient = new ApiClient();
  apiClient.setBasePath(DOCUSIGN_API_BASE_PATH);
  apiClient.addDefaultHeader(
    "Authorization",
    "Bearer " + (await getAccessToken())
  );

  const envelopesApi = new EnvelopesApi(apiClient);

  // Define the server template
  const serverTemplate = ServerTemplate.constructFromObject({
    sequence: "1",
    templateId: DOCUSIGN_TEMPLATE_ID,
  });

  // Load the additional PDF to get the page count
  const pdfDoc = await PDFDocument.load(additionalPdfBytes);
  const totalPages = pdfDoc.getPageCount();

  // Define the second document (dynamically generated document)
  const documentBase64 = Buffer.from(additionalPdfBytes).toString("base64");
  const document = Document.constructFromObject({
    documentBase64,
    name: "Additional Document",
    fileExtension: "pdf",
    documentId: "2",
  });

  const signer = Signer.constructFromObject({
    email,
    name: DOCUSIGN_SIGNER_NAME,
    recipientId: "1",
    roleName: "Signer",
    clientUserId: "1000", // Unique identifier for embedded signing
  });

  const textTabs = [];
  for (const [key, value] of Object.entries(invoiceDetails)) {
    const textField = Text.constructFromObject({
      tabLabel: key,
      value: (value as any).toString(),
    });
    textTabs.push(textField);
  }

  const tabs = Tabs.constructFromObject({ textTabs });

  // Add SignHere tabs for each page of the additional PDF
  const signHereTabs = [];
  for (let i = 1; i <= totalPages; i++) {
    signHereTabs.push(
      SignHere.constructFromObject({
        documentId: "2",
        pageNumber: i.toString(),
        recipientId: "1",
        tabLabel: `SignHereTab_${i}`,
        xPosition: "100", // Customize the position as needed
        yPosition: "700", // Customize the position as needed
      })
    );
  }

  tabs.signHereTabs = signHereTabs;
  signer.tabs = tabs;

  const recipients = Recipients.constructFromObject({ signers: [signer] });

  // Define the inline template for the additional document
  const inlineTemplateForAdditionalDoc = InlineTemplate.constructFromObject({
    sequence: "2",
    recipients,
    documents: [document],
  });

  // Define the inline template for the predefined template
  const inlineTemplateForServerTemplate = InlineTemplate.constructFromObject({
    sequence: "1",
    recipients,
  });

  const compositeTemplate1 = CompositeTemplate.constructFromObject({
    compositeTemplateId: "1",
    serverTemplates: [serverTemplate],
    inlineTemplates: [inlineTemplateForServerTemplate],
  });

  const compositeTemplate2 = CompositeTemplate.constructFromObject({
    compositeTemplateId: "2",
    inlineTemplates: [inlineTemplateForAdditionalDoc],
  });

  const envDef = EnvelopeDefinition.constructFromObject({
    emailSubject: "Please sign this document",
    status: "sent",
    compositeTemplates: [compositeTemplate1, compositeTemplate2],
  });

  try {
    const envelopeSummary = await envelopesApi.createEnvelope(
      DOCUSIGN_ACCOUNT_ID,
      { envelopeDefinition: envDef }
    );

    return envelopeSummary.envelopeId;
  } catch (error: any) {
    console.error(
      "Error sending document to DocuSign:",
      error.response?.data || error
    );
    throw error;
  }
}
