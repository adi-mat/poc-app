import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import ConnectSupabaseSteps from "@/components/tutorial/ConnectSupabaseSteps";
import SignUpUserSteps from "@/components/tutorial/SignUpUserSteps";
import Header from "@/components/Header";
import { redirect } from "next/navigation";

export default async function Index() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  } else {
    return redirect("/dashboard");
  }

  // return (
  //   <div className="flex-1 w-full flex flex-col gap-20 items-center">
  //     <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
  //       <div className="w-full max-w-4xl flex justify-end items-center p-3 text-sm">
  //         <AuthButton />
  //       </div>
  //     </nav>

  //     <div>
  //       <Header />
  //     </div>

  //     <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs"></footer>
  //   </div>
  // );
}
