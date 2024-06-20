import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Merges multiple PDF files into one and adds invoice details as a page if provided.
 * @param {Blob[]} pdfBlobs - Array of PDF blobs to be merged.
 * @param {Object} invoiceDetails - Invoice details to be included in the PDF.
 * @returns {Promise<Uint8Array>} - Merged PDF as Uint8Array.
 */
export async function mergePdfs(
  pdfBlobs: Blob[],
  invoiceDetails: any
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  // Add invoice details as a new page if provided
  if (invoiceDetails) {
    const page = mergedPdf.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);

    page.drawText("Invoice Details:", {
      x: 50,
      y: height - fontSize * 2,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    const {
      id,
      customer_name,
      invoice_date,
      due_date,
      item_description,
      quantity,
      unit_price,
      total_price,
      status,
      notes,
      address,
      balance,
      tax,
    } = invoiceDetails;

    const details = `
      Invoice ID: ${id}
      Customer Name: ${customer_name}
      Invoice Date: ${invoice_date}
      Due Date: ${due_date}
      Item Description: ${item_description}
      Quantity: ${quantity}
      Unit Price: ${unit_price}
      Total Price: ${total_price}
      Status: ${status}
      Notes: ${notes}
      Address: ${address}
      Balance: ${balance}
      Tax: ${tax}
    `;

    const lines = details.trim().split("\n");
    let y = height - fontSize * 4;
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 4;
    }
  }

  for (const pdfBlob of pdfBlobs) {
    const pdfBytes = await pdfBlob.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();

  return mergedPdfBytes;
}
