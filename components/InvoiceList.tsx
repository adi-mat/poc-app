"use client";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import UploadMorePdfs from "./UploadMorePdfs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

const formSchema = z.object({
  customer_name: z.string().min(1, { message: "Customer name is required" }),
  invoice_date: z.string().min(1, { message: "Invoice date is required" }),
  due_date: z.string().min(1, { message: "Due date is required" }),
  item_description: z
    .string()
    .min(1, { message: "Item description is required" }),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().min(1, { message: "Quantity is required" })
  ),
  unit_price: z.preprocess(
    (val) => Number(val),
    z.number().min(1, { message: "Unit price is required" })
  ),
  total_price: z.preprocess(
    (val) => Number(val),
    z.number().min(1, { message: "Total price is required" })
  ),
  status: z.string().min(1, { message: "Status is required" }),
  notes: z.string().optional(),
  address: z.string().optional(),
  balance: z.preprocess((val) => Number(val), z.number().optional()),
  tax: z.preprocess((val) => Number(val), z.number().optional()),
});

const updateFormSchema = formSchema.extend({
  legacy_invoice_id: z.number().optional(),
  id: z.number().optional(),
});

interface Invoice {
  id?: number;
  invoice_id?: number; // For legacy invoices
  legacy_invoice_id?: number;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  notes?: string;
  address?: string;
  balance?: number; // Expecting number
  tax?: number; // Expecting number
}

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
  source,
  onSave,
}: {
  invoiceList: Array<Invoice>;
  loading: boolean;
  error: string;
  source: string;
  onSave: (data: any, source: string, index: number) => void;
}) {
  const [newFields, setNewFields] = useState<NewFields>({});
  const [uploadMorePdfs, setUploadMorePdfs] = useState(false);
  const [combinedInvoice, setCombinedInvoice] = useState<Invoice | null>(null);

  const handleSave = async (data: any, index: number) => {
    const invoice = invoiceList[index] || {};
    const additionalDetails = newFields[index] || {};
    let combinedInvoice = { ...invoice, ...data, ...additionalDetails };

    // Adjust the payload based on the source
    if (source === "legacy") {
      // For legacy source, ensure legacy_invoice_id is included
      combinedInvoice = {
        ...combinedInvoice,
        legacy_invoice_id: invoice.invoice_id, // Use invoice_id from legacy as legacy_invoice_id
      };
      delete combinedInvoice.invoice_id; // Remove invoice_id from payload
    } else if (source === "current") {
      // For current source, ensure id is included
      combinedInvoice = { ...combinedInvoice, id: invoice.id };
    }

    localStorage.setItem("additionalFields", JSON.stringify(combinedInvoice));
    console.log("Combined Invoice Details:", combinedInvoice);
    setCombinedInvoice(combinedInvoice);

    try {
      await onSave(combinedInvoice, source, index);
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
      setUploadMorePdfs(true);
    } catch (error) {
      console.error("There was a problem with the save operation:", error);
    }
  };

  const form = useForm({
    resolver: zodResolver(
      invoiceList.length > 0 ? updateFormSchema : formSchema
    ),
    defaultValues: {
      customer_name: "",
      invoice_date: "",
      due_date: "",
      item_description: "",
      quantity: 0,
      unit_price: 0,
      total_price: 0,
      status: "",
      notes: "",
      address: "",
      balance: 0,
      tax: 0,
      ...(invoiceList.length > 0
        ? { legacy_invoice_id: undefined, id: undefined }
        : {}),
    },
  });

  useEffect(() => {
    if (invoiceList.length > 0 && invoiceList[0]) {
      const firstInvoice = invoiceList[0];
      form.reset({
        // @ts-ignore
        legacy_invoice_id: firstInvoice.legacy_invoice_id,
        // @ts-ignore
        id: firstInvoice.id,
        customer_name: firstInvoice.customer_name || "",
        invoice_date: firstInvoice.invoice_date || "",
        due_date: firstInvoice.due_date || "",
        item_description: firstInvoice.item_description || "",
        quantity: firstInvoice.quantity || 0,
        unit_price: firstInvoice.unit_price || 0,
        total_price: firstInvoice.total_price || 0,
        status: firstInvoice.status || "",
        notes: firstInvoice.notes || "",
        address: firstInvoice.address || "",
        balance: firstInvoice.balance || 0,
        tax: firstInvoice.tax || 0,
      });
    } else {
      form.reset({
        customer_name: "",
        invoice_date: "",
        due_date: "",
        item_description: "",
        quantity: 0,
        unit_price: 0,
        total_price: 0,
        status: "",
        notes: "",
        address: "",
        balance: 0,
        tax: 0,
      });
    }
  }, [invoiceList, form]);

  return (
    <div>
      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && invoiceList.length === 0 && (
        <>
          <div className="text-center text-gray-500 mt-4">
            No invoices found
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 border mt-4 border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Create Invoice
            </h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => handleSave(data, 0))}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        <Input {...field} className="mb-2 w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoice_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="mb-2 w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="mb-2 w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="item_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Description</FormLabel>
                      <FormControl>
                        <Input {...field} className="mb-2 w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="mb-2 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="mb-2 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="mb-2 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Input {...field} className="mb-2 w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input {...field} className="mb-2 w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} className="mb-2 w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="mb-2 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className="mb-2 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="mt-4">
                  Save and Generate PDF
                </Button>
              </form>
            </Form>
          </div>
        </>
      )}
      {!loading && invoiceList.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {invoiceList.map((invoice, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    handleSave(
                      {
                        ...data,
                        legacy_invoice_id: invoice.legacy_invoice_id,
                        id: invoice.id,
                      },
                      index
                    )
                  )}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    // @ts-ignore
                    name="invoice_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={
                              invoice.legacy_invoice_id ||
                              invoice.invoice_id ||
                              ""
                            }
                            readOnly
                            className="mb-2 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <FormControl>
                          <Input {...field} className="mb-2 w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoice_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="mb-2 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="mb-2 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="item_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Description</FormLabel>
                        <FormControl>
                          <Input {...field} className="mb-2 w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="mb-2 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="mb-2 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="mb-2 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Input {...field} className="mb-2 w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input {...field} className="mb-2 w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} className="mb-2 w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Balance</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="mb-2 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="mb-2 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="mt-4">
                    Save and Generate PDF
                  </Button>
                </form>
              </Form>
              {uploadMorePdfs && (
                <div className="mt-4">
                  <UploadMorePdfs combinedInvoice={combinedInvoice} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
