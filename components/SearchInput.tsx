"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import useSearchInvoices from "./hooks/useSearchInvoices";
import InvoiceList from "./InvoiceList";

export default function SearchInput() {
  const {
    handleSearchInvoice,
    loading,
    error,
    invoice,
    invoiceId,
    setInvoiceId,
  } = useSearchInvoices();

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
      <InvoiceList loading={loading} error={error ?? ""} invoiceList={data} />
    </div>
  );
}
