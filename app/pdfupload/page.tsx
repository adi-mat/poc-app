"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SecondPage() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setUploadedFiles((prevFiles) => [...prevFiles, file]);
  };

  const handleDeleteFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleMerge = () => {
    // Fetch additional fields from localStorage
    const additionalFields = JSON.parse(
      localStorage.getItem("additionalFields") || ""
    );

    // Create FormData object to send files to the backend
    const formData = new FormData();
    formData.append("additionalFields", JSON.stringify(additionalFields));
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    // // Send FormData to backend for merging and saving
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
        // // Navigate to a success page or do any other action
        // router.push("/success");
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        // Handle error, e.g., show an error message
      });
  };

  return (
    <div>
      <h2>Upload PDF Files</h2>
      <div>
        <Input
          type="file"
          onChange={handleFileChange}
          accept="application/pdf"
        />
      </div>
      <div>
        {uploadedFiles.map((file, index) => (
          <div key={index}>
            <span>{file.name}</span>
            <Button onClick={() => handleDeleteFile(index)}>Delete</Button>
          </div>
        ))}
      </div>
      <Button onClick={handleMerge}>Merge and Save PDF</Button>
    </div>
  );
}
