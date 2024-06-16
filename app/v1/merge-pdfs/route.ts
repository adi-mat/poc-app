import { NextResponse } from "next/server";
import { mergePdfs } from "@/utils/pdf-utils";
import { sendToDocuSign } from "@/utils/docusign-utils";
import { createClient } from "@/utils/supabase/server";

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
    const mergedPdfBytes = await mergePdfs(fileBlobs, invoiceDetails);

    // Send the merged PDF to DocuSign for signature
    const docuSignResponse = await sendToDocuSign(
      mergedPdfBytes as Buffer,
      user?.email as string
    );
    // console.log(docuSignResponse, "docuSignResponse");

    return NextResponse.json({ docuSignResponse });
  } catch (error: any) {
    //console.log(error, "error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
