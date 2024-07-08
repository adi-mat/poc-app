"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { registerUser } from "../actions/registerUser";

const formSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  address: z.string().min(1, "Address is required"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
});

export default function RegisterForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      address: "",
      mobileNumber: "",
    },
  });

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const result = await registerUser(values);
      toast({
        description: "Registration successful!",
      });
      console.log(result, "Saved data");
    } catch (error) {
      console.error(error, "Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Finish creating an account
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => handleSave(data))}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">
                  Full name *
                </FormLabel>
                <FormControl>
                  <Input
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your full name"
                    {...field}
                  />
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
                <FormLabel className="text-gray-700 font-semibold">
                  Address *
                </FormLabel>
                <FormControl>
                  <Input
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">
                  Phone *
                </FormLabel>
                <FormControl>
                  <Input
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter 10 digit mobile number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? <LoadingSpinner /> : "Confirm"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
