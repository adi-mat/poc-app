import RegisterForm from "./RegisterForm";
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

  const { data, error } = await supabase
    .from("user_profile")
    .select("registration_complete")
    .eq("id", user.id)
    .single();

  if (data?.registration_complete) {
    return redirect("/dashboard");
  } else {
    return <RegisterForm />;
  }
}
