"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { updateProfile } from "../../actions/updateProfile";

const formSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  address: z.string().min(1, "Address is required"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  email: z.string().email("Invalid email address"),
});

export default function Profile({ profile }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      address: "",
      mobileNumber: "",
      email: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }

    setLoading(false);
  }, [form, profile]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    setProfileUpdateLoading(true);
    try {
      const result = await updateProfile(values);
      toast({
        description: "Profile Updated!",
      });
    } catch (error) {
      console.error("Failed to save data", error);
      toast({
        description: "Failed to update profile.",
        status: "error",
      });
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 p-8 bg-white rounded-lg shadow-md max-w-2xl">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
        Update Profile
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => handleSave(data))}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your email"
                    {...field}
                    disabled
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
                  Mobile Number
                </FormLabel>
                <FormControl>
                  <Input
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your mobile number"
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
                  Address
                </FormLabel>
                <FormControl>
                  <Input
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-5 flex-row w-1/2">
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {profileUpdateLoading ? <LoadingSpinner /> : "Save"}
            </Button>
            <Button
              onClick={() => router.back()}
              type="button"
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
