import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: Request, context: any) {
  console.log("in this");
  const res = await request.json();
  console.log(res, "res");
  // const supabase = createClient();
  // const { data, error } = await supabase("invoices").select().eq("invoice_id", context.params.invoiceId);
  // request.body = JSON.stringify(data);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 20;

  const {
    invoice_id,
    customer_name,
    invoice_date,
    item_description,
    total_price,
    unit_price,
    notes,
    quantity,
    status,
    address,
    balance,
    tax,
  } = res;

  // const invoice_id = res.get("invoice_id");
  // const customer_name = res.get("customer_name");
  // const invoice_date = res.get("invoice_date");
  // const item_description = res.get("item_description");
  // const total_price = res.get("total_price");
  // const unit_price = res.get("unit_price");
  // const notes = res.get("notes");
  // const quantity = res.get("quantity");
  // const status = res.get("status");
  // const address = res.get("address");
  // const balance = res.get("balance");
  // const tax = res.get("tax");
  // Add content to the PDF
  page.drawText(`Invoice ID: ${invoice_id}`, {
    x: 50,
    y: height - 50,
    size: fontSize,
  });
  page.drawText(`Customer Name: ${customer_name}`, {
    x: 50,
    y: height - 80,
    size: fontSize,
  });
  page.drawText(`Invoice Date: ${invoice_date}`, {
    x: 50,
    y: height - 110,
    size: fontSize,
  });
  page.drawText(`Item Description: ${item_description}`, {
    x: 50,
    y: height - 140,
    size: fontSize,
  });
  page.drawText(`Total Price: ${total_price}`, {
    x: 50,
    y: height - 170,
    size: fontSize,
  });
  page.drawText(`Notes: ${notes}`, {
    x: 50,
    y: height - 200,
    size: fontSize,
  });
  page.drawText(`Quantity: ${quantity}`, {
    x: 50,
    y: height - 230,
    size: fontSize,
  });
  page.drawText(`Unit Price: ${unit_price}`, {
    x: 50,
    y: height - 260,
    size: fontSize,
  });
  page.drawText(`Status: ${status}`, {
    x: 50,
    y: height - 290,
    size: fontSize,
  });
  page.drawText(`Address: ${address}`, {
    x: 50,
    y: height - 320,
    size: fontSize,
  });
  page.drawText(`Balance: ${balance}`, {
    x: 50,
    y: height - 350,
    size: fontSize,
  });
  page.drawText(`Tax: ${tax}`, {
    x: 50,
    y: height - 380,
    size: fontSize,
  });

  // Save the PDF to a buffer
  const pdfBytes = await pdfDoc.save();

  const response = new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=invoice.pdf",
    },
  });

  return response;
}
