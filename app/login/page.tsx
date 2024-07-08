import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "./submit-button";
import { LoginWithGoogle } from "@/app/icons/LoginWithGoogle";
import { LoginWithFacebook } from "@/app/icons/LoginWithFacebook";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  async function signInWithEmail(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const origin = headers().get("origin");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${origin}/dashboard`,
      },
    });

    if (!email) {
      return redirect(`/login?message=Please enter an email address`);
    }

    if (error) {
      console.log(error.message, "error");
      return redirect(`/login?message=${error.message}`);
    }

    return redirect(`/login?message=Confirm your email address to sign in`);
  }

  async function signInWithFacebook() {
    "use server";
    const origin = headers().get("origin");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    console.log(data, "data");
    if (error) {
      console.log(error, "error");
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect(data.url);
  }

  const signInWithGoogle = async () => {
    "use server";
    const origin = headers().get("origin");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: `${origin}/auth/callback`,
      },
    });

    console.log(data, "data");
    if (error) {
      console.log(error, "error");
      return redirect(`/login?message=${error.message}`);
    }

    return redirect(data.url);
  };

  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex-1 flex flex-col h-full w-full max-w-md px-8 justify-center gap-4">
        <form className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
          <div className="flex flex-col gap-2">
            <label className="text-md" htmlFor="email">
              Email
            </label>
            <input
              className="rounded-md px-4 py-2 bg-inherit border"
              name="email"
              placeholder="you@example.com"
            />
          </div>
          <SubmitButton
            formAction={signInWithEmail}
            className="border border-foreground/20 rounded-md px-4 py-2 text-foreground"
            pendingText="Signing In..."
          >
            Log in
          </SubmitButton>
          <SubmitButton
            formAction={signInWithGoogle}
            className="border border-foreground/20 rounded-md px-4 py-2 flex items-center justify-center gap-2 text-foreground"
            pendingText="Signing in with google..."
          >
            <LoginWithGoogle />
            Login with Google
          </SubmitButton>
          <SubmitButton
            formAction={signInWithFacebook}
            className="border border-foreground/20 rounded-md px-4 py-2 flex items-center justify-center gap-2 text-foreground"
            pendingText="Signing in with facebook..."
          >
            <LoginWithFacebook />
            Login with Facebook
          </SubmitButton>
          {searchParams?.message && (
            <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
              {searchParams.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
