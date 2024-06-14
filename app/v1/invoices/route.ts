import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface Invoice {
  id?: any;
  invoice_id?: number;
  legacy_invoice_id?: number;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  notes?: string;
  address?: string;
  balance?: number;
  tax?: number;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { invoice, source }: { invoice: Invoice; source: string } =
    await request.json();

  if (source === "current") {
    // Update existing invoice in Current Invoice Table
    const { data, error } = await supabase
      .from("current_invoices")
      .update(invoice)
      .eq("id", invoice.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoice: data });
  } else if (source === "legacy") {
    // Insert new invoice in Current Invoice Table and link to Legacy Invoice
    const { data, error } = await supabase
      .from("current_invoices")
      .insert(invoice)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const link = await supabase
      .from("current_invoices")
      .update({ legacy_invoice_id: invoice.invoice_id })
      .eq("id", data.id);

    if (link.error) {
      return NextResponse.json({ error: link.error.message }, { status: 500 });
    }

    return NextResponse.json({ invoice: data });
  } else if (source === "new") {
    // Create new invoice in Current Invoice Table
    const { data, error } = await supabase
      .from("current_invoices")
      .insert(invoice)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoice: data });
  }
}
