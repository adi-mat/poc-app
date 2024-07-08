import ProfileForm from "./ProfileForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Register() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let profile = null;
  if (user) {
    const { data, error } = await supabase
      .from("user_profile")
      .select("fullName, address, mobileNumber, email")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return <ProfileForm profile={profile} />;
}
