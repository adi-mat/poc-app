import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request, context: any) {
    const supabase = createClient()
    console.log(supabase, 'supabase');
    const { data, error } = await supabase
        .from('invoices')
        .select()
        .eq('invoice_id', context.params.invoiceId) 
        return NextResponse.json({
            data
        })
}