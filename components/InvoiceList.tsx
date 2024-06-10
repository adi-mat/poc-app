"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import UploadMorePdfs from "./UploadMorePdfs";

interface PrevFields {
  [key: number]: {
    [key: string]: string;
  };
}

interface NewFields {
  [key: number]: {
    [key: string]: string;
  };
}

export default function InvoiceList({
  invoiceList,
  loading,
  error,
}: {
  invoiceList: Array<object>;
  loading: boolean;
  error: string;
}) {
  const [newFields, setNewFields] = useState<NewFields>({});
  const [uploadMorePdfs, setUploadMorePdfs] = useState(false);

  const handleInputChange = (index: number, field: string, value: string) => {
    setNewFields((prevFields: PrevFields) => ({
      ...prevFields,
      [index]: {
        ...prevFields[index],
        [field]: value,
      },
    }));
  };

  const handleSave = async (
    invoice: {
      invoice_id: any;
      customer_name: any;
      invoice_date: any;
      item_description: any;
      total_price: any;
      unit_price: any;
      notes: any;
      quantity: any;
      status: any;
    },
    index: number
  ) => {
    const additionalDetails = newFields[index] || {};
    const combinedInvoice = { ...invoice, ...additionalDetails };
    localStorage.setItem("additionalFields", JSON.stringify(combinedInvoice));
    console.log("Combined Invoice Details:", combinedInvoice);
    try {
      const response = await fetch("v1/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(combinedInvoice),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "invoice.pdf"; // Specify the desired file name
      document.body.appendChild(a); // Append the link to the body
      a.click(); // Programmatically click the link to trigger the download
      document.body.removeChild(a); // Remove the link from the document

      // Revoke the object URL to free up memory
      window.URL.revokeObjectURL(url);
      setUploadMorePdfs(true);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  return (
    <div>
      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {invoiceList?.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {invoiceList.map(
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
              }: any,
              index
            ) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
              >
                <p>Invoice ID: {invoice_id}</p>
                <p>Customer: {customer_name}</p>
                <p>Invoice Date: {invoice_date}</p>
                <p>Item: {item_description}</p>
                <p>Total Price: {total_price}</p>
                <p>Unit Price: {unit_price}</p>
                <p>Notes: {notes}</p>
                <p>Quantity: {quantity}</p>
                <p>Status: {status}</p>
                <div className="mt-4">
                  <h4 className="text-md font-semibold mb-2">
                    Add More Details
                  </h4>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    type="text"
                    id="address"
                    value={newFields[index]?.address || ""}
                    onChange={(e) =>
                      handleInputChange(index, "address", e.target.value)
                    }
                    className="mb-2 w-full"
                  />
                  <Label htmlFor="balance">Balance</Label>
                  <Input
                    type="text"
                    id="balance"
                    value={newFields[index]?.balance || ""}
                    onChange={(e) =>
                      handleInputChange(index, "balance", e.target.value)
                    }
                    className="mb-2 w-full"
                  />
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    type="text"
                    id="tax"
                    value={newFields[index]?.tax || ""}
                    onChange={(e) =>
                      handleInputChange(index, "tax", e.target.value)
                    }
                    className="mb-2 w-full"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleSave(
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
                      )
                    }
                    className="mt-4"
                  >
                    Save and Generate PDF
                  </Button>
                </div>
                {uploadMorePdfs && (
                  <div className="mt-4">
                    <UploadMorePdfs />
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
