"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const DOCUSIGN_API_BASE_PATH = process.env.NEXT_PUBLIC_DOCUSIGN_API_BASE_PATH; // Update this line to match your env setup

export default function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/v1/documents");
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }

        const data = await response.json();
        setDocuments(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const groupedDocuments = (
    documents as { envelopes?: any[] }
  )?.envelopes?.reduce((acc, doc) => {
    (acc[doc.status] = acc[doc.status] || []).push(doc);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">My Documents</h2>
      {Object.keys(groupedDocuments).map((status) => (
        <div key={status} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{status}</h3>
          <ul className="space-y-2">
            {groupedDocuments[status].map((doc: any) => (
              <li
                key={doc.envelopeId}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-md"
              >
                <div className="flex-1">
                  <p>
                    <strong>Envelope ID:</strong> {doc.envelopeId}
                  </p>
                  <p>
                    <strong>Last Modified:</strong>{" "}
                    {format(
                      new Date(doc.lastModifiedDateTime),
                      "yyyy-MM-dd HH:mm:ss"
                    )}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = `/v1/download-document/${doc.envelopeId}`;
                    link.setAttribute("download", "signed_document.pdf");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Download Document
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
