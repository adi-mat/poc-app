import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SearchInput from "@/app/dashboard/SearchInput";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data, error } = await supabase
    .from("user_profile")
    .select("registration_complete")
    .eq("id", user.id)
    .single();

  if (!data?.registration_complete) {
    return redirect("/register");
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center gap-4">
      <div className="w-full">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-end items-center p-3 text-sm">
            <AuthButton />
          </div>
        </nav>
      </div>

      <div className="w-full flex justify-center">
        <div className="w-1/2">
          <SearchInput />
        </div>
      </div>

      <footer></footer>
    </div>
  );
}
