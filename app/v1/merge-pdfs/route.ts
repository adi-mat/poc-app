import { NextResponse } from "next/server";
import { mergePdfs } from "@/utils/pdf-utils";
import { sendToDocuSign } from "@/utils/docusign-utils";

export async function POST(request: Request) {
  const formData = await request.formData();
  const invoiceDetails = JSON.parse(formData.get("invoiceDetails") as string);
  const files = formData.getAll("files") as Blob[];

  const fileBlobs = files.map((file) => file);

  try {
    // Merging the PDFs
    const mergedPdfBytes = await mergePdfs(fileBlobs, invoiceDetails);

    // Send the merged PDF to DocuSign for signature
    const docuSignResponse = await sendToDocuSign(mergedPdfBytes);
    // console.log(docuSignResponse, "docuSignResponse");

    return NextResponse.json({ docuSignResponse });
  } catch (error) {
    //console.log(error, "error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
