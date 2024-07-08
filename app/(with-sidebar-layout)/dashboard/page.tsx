import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SearchInput from "@/app/(with-sidebar-layout)/dashboard/SearchInput";

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

  console.log(data, "reg complete");
  if (!data?.registration_complete) {
    return redirect("/register");
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center gap-4">
      <div className="w-full flex justify-center mt-4">
        <div className="w-full">
          <SearchInput />
        </div>
      </div>

      <footer></footer>
    </div>
  );
}
