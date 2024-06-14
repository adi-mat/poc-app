import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request, context: any) {
  const supabase = createClient();
  const invoiceId = context.params.invoiceId;

  // Step 1: Check if the invoice exists in the current_invoices table by legacy_invoice_id
  const { data: currentInvoiceByLegacy, error: currentErrorByLegacy } =
    await supabase
      .from("current_invoices")
      .select()
      .eq("legacy_invoice_id", invoiceId)
      .maybeSingle();

  if (currentErrorByLegacy) {
    return NextResponse.json(
      { error: currentErrorByLegacy.message },
      { status: 500 }
    );
  }

  if (currentInvoiceByLegacy) {
    return NextResponse.json({
      invoice: currentInvoiceByLegacy,
      source: "current",
    });
  }

  // Step 2: If not found by legacy link, check in the legacy invoices table by invoice_id
  const { data: legacyInvoice, error: legacyError } = await supabase
    .from("invoices")
    .select()
    .eq("invoice_id", invoiceId)
    .maybeSingle();

  if (legacyError) {
    return NextResponse.json({ error: legacyError.message }, { status: 500 });
  }

  if (legacyInvoice) {
    return NextResponse.json({ invoice: legacyInvoice, source: "legacy" });
  }

  // Step 3: If not found in either legacy link or legacy table, check current_invoices table by id
  const { data: currentInvoiceById, error: currentErrorById } = await supabase
    .from("current_invoices")
    .select()
    .eq("id", invoiceId)
    .maybeSingle();

  if (currentErrorById) {
    return NextResponse.json(
      { error: currentErrorById.message },
      { status: 500 }
    );
  }

  if (currentInvoiceById) {
    return NextResponse.json({
      invoice: currentInvoiceById,
      source: "current",
    });
  }

  // If not found in any table, return as a new invoice
  return NextResponse.json({ invoice: null, source: "new" });
}
