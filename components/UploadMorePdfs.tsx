"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const DOCUSIGN_API_BASE_PATH = "https://demo.docusign.net/restapi";
export default function UploadMorePdfs({
  combinedInvoice,
}: {
  combinedInvoice: any;
}) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [docuSignResponse, setDocuSignResponse] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prevFiles) => [...prevFiles, ...filesArray]);
    }
  };

  const handleDeleteFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMerge = async () => {
    const formData = new FormData();
    formData.append("invoiceDetails", JSON.stringify(combinedInvoice));

    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/v1/merge-pdfs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setDocuSignResponse(result.docuSignResponse);
      console.log(docuSignResponse, "docuSignResponse");

      // Optionally, open the DocuSign envelope in a new tab
      // window.open(
      //   `${DOCUSIGN_API_BASE_PATH}${result.docuSignResponse.uri}`,
      //   "_blank"
      // );
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Upload PDF Files
      </h2>
      <div className="mb-4">
        <Input
          type="file"
          multiple
          onChange={handleFileChange}
          accept="application/pdf"
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <div className="mb-4">
        {uploadedFiles.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between mb-2 p-2 border border-gray-200 rounded-md"
          >
            <span className="text-gray-700">{file.name}</span>
            <Button
              onClick={() => handleDeleteFile(index)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
      <Button
        onClick={handleMerge}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={uploadedFiles.length === 0}
      >
        Merge and Save PDF
      </Button>
      {docuSignResponse && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          <h3 className="text-lg font-semibold">DocuSign Envelope Sent</h3>
          <p>
            <strong>Envelope ID:</strong> {docuSignResponse.envelopeId}
          </p>
          <p>
            <strong>Status:</strong> {docuSignResponse.status}
          </p>
          <p>
            <strong>Status Date Time:</strong> {docuSignResponse.statusDateTime}
          </p>
          {/* <a
            href={`${DOCUSIGN_API_BASE_PATH}${docuSignResponse.uri}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            View Envelope
          </a> */}
        </div>
      )}
    </div>
  );
}
