"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
    searchExecuted,
  } = useSearchInvoices();

  const [saveError, setSaveError] = useState<string | null>(null);

  const data = invoice?.invoice ? [invoice.invoice] : [];
  const source = invoice?.source ?? "new";

  const handleSaveInvoice = async (
    data: any,
    source: string,
    index: number
  ) => {
    try {
      const response = await fetch(`/v1/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice: data, source }),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Invoice saved successfully");
        setSaveError(null); // Clear any previous errors
        return result;
      } else {
        setSaveError(result.error);
      }
    } catch (err) {
      setSaveError("Error saving invoice");
    }
  };

  return (
    <div>
      <div className="flex gap-2 w-full">
        <Input
          type="text"
          placeholder="Enter an invoice ID between 1 and 10"
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
      {searchExecuted && (
        <InvoiceList
          loading={loading}
          error={error ?? ""}
          invoiceList={data}
          source={source}
          onSave={handleSaveInvoice}
        />
      )}
      {saveError && <div className="text-center text-red-500">{saveError}</div>}
    </div>
  );
}
