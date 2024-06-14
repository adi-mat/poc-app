// pages/api/verifyEnv.js
export default function handler(req, res) {
  const integratorKey = process.env.DOCUSIGN_INTEGRATOR_KEY;
  const userId = process.env.DOCUSIGN_USER_ID;
  const basePath = process.env.DOCUSIGN_API_BASE_PATH;
  const privateKey = process.env.DOCUSIGN_PRIVATE_KEY ? "Loaded" : "Missing";
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const signerEmail = process.env.DOCUSIGN_SIGNER_EMAIL;
  const signerName = process.env.DOCUSIGN_SIGNER_NAME;

  res.status(200).json({
    integratorKey,
    userId,
    basePath,
    privateKey,
    accountId,
    signerEmail,
    signerName,
  });
}
