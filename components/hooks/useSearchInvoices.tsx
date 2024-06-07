"use client";

import { useState } from "react";

export default function useSearchInvoices() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchInvoice = async (invoiceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/v1/invoices/${invoiceId}`);
      const data = await response.json();
      console.log(data, "data");

      if (response.ok) {
        setInvoice(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err as any);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSearchInvoice,
    loading,
    error,
    invoice,
  };
}
