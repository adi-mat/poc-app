"use client";

import { useState } from "react";

export default function useSearchInvoices() {
  const [invoice, setInvoice] = useState({ invoice: null, source: "new" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoiceId, setInvoiceId] = useState("");
  const [searchExecuted, setSearchExecuted] = useState(false);

  const handleSearchInvoice = async (invoiceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/v1/invoices/${invoiceId}`);
      const data = await response.json();

      if (response.ok) {
        setInvoice(data);
        setInvoiceId("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err as any);
    } finally {
      setLoading(false);
      setSearchExecuted(true);
    }
  };

  return {
    handleSearchInvoice,
    loading,
    error,
    invoice,
    invoiceId,
    setInvoiceId,
    searchExecuted,
  };
}
