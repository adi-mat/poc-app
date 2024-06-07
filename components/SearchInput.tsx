"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import useSearchInvoices from "./hooks/useSearchInvoices";

export default function SearchInput() {
  const [invoiceId, setInvoiceId] = useState("");
  const { handleSearchInvoice, loading, error, invoice } = useSearchInvoices();

  const data = invoice?.data ?? [];

  return (
    <div>
      <div className="flex gap-2 w-full">
        <Input
          type="text"
          placeholder="Search Invoice"
          onChange={(e) => setInvoiceId(e.target.value)}
          value={invoiceId}
        />
        <Button
          type="submit"
          onClick={() => {
            handleSearchInvoice(invoiceId);
          }}
        >
          Search
        </Button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {data.length > 0 &&
        data.map(
          (
            {
              invoice_id,
              customer_name,
              invoice_date,
              item_description,
              total_price,
              unit_price,
              notes,
              quantity,
              status,
            },
            index
          ) => {
            return (
              <div className="p-10" key={index}>
                <p>InvoiceId: {invoice_id}</p>
                <p>Customer: {customer_name}</p>
                <p>Invoice_date: {invoice_date}</p>
                <p>Item: {item_description}</p>
                <p>total_price: {total_price}</p>
                <p>unit_price: {unit_price}</p>
                <p>notes: {notes}</p>
                <p>quantity: {quantity}</p>
                <p>status: {status}</p>
              </div>
            );
          }
        )}
    </div>
  );
}
