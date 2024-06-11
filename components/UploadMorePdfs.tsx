"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UploadMorePdfs() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: any) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleDeleteFile = (index: number) => {
    setUploadedFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);

      // Clear the file input value if no files are left
      if (updatedFiles.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return updatedFiles;
    });
  };

  const handleMerge = () => {
    // Fetch additional fields from localStorage
    const additionalFields = JSON.parse(
      localStorage.getItem("additionalFields") || "{}"
    );

    // Create FormData object to send files to the backend
    const formData = new FormData();
    formData.append("additionalFields", JSON.stringify(additionalFields));
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    // Send FormData to backend for merging and saving
    fetch("/v1/generate-pdf", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Handle response, e.g., show a success message
        console.log("Merged PDF saved successfully:", data);
        // Navigate to a success page or do any other action
        // router.push("/success");
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        // Handle error, e.g., show an error message
      });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 mt-4">
      <h2 className="text-md font-semibold mb-2">Upload more PDF Files</h2>
      <div className="mb-2">
        <Input
          type="file"
          multiple
          onChange={handleFileChange}
          accept="application/pdf"
          ref={fileInputRef}
          className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <div className="mb-2">
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
        className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={uploadedFiles.length === 0}
      >
        Merge and Save PDFs
      </Button>
    </div>
  );
}
