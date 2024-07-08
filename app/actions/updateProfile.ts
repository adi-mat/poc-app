"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const updateProfile = async (values: any) => {
  const supabase = createClient();
  const { fullName, mobileNumber, address } = values;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("user_profile")
      .update({ mobileNumber, fullName, address })
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    } else {
      redirect("/dashboard");
    }
  }
};
