import { createClient } from "@/utils/supabase/server";
import { LogOut } from "@geist-ui/icons";
import { redirect } from "next/navigation";
import { NavItem } from "../app/nav-item";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return user ? (
    <div className="flex items-center gap-4 mb-10">
      <form action={signOut}>
        <button
          type="submit"
          className="flex items-center gap-3 px-3 py-2 text-gray-900 transition-all  rounded-lg hover:text-gray-900 dark:text-gray-50 dark:bg-gray-800 dark:hover:text-gray-50"
        >
          <LogOut />
          Logout
        </button>
      </form>
    </div>
  ) : (
    <NavItem href="/login">Login</NavItem>
  );
}
