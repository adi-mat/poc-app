"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface RegisterUserType {
  fullName: string;
  mobileNumber: string;
  address: string;
}

export const registerUser = async (data: RegisterUserType) => {
  const { fullName, mobileNumber, address } = data;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const { data, error } = await supabase
      .from("user_profile")
      .update({ mobileNumber, fullName, address, registration_complete: true })
      .eq("id", user?.id);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    redirect("/dashboard");
  }
};
