import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "./submit-button";
import { isAuthApiError } from "@supabase/supabase-js";
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
        // set this to false if you do not want the user to be automatically signed up
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

  // const signUp = async (formData: FormData) => {
  //   "use server";

  //   const origin = headers().get("origin");
  //   const email = formData.get("email") as string;
  //   const password = formData.get("password") as string;
  //   const supabase = createClient();

  //   if (password.length < 6) {
  //     return redirect(
  //       `/login?message=Password must be at least 6 characters long`
  //     );
  //   }

  //   const { error } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       emailRedirectTo: `${origin}/auth/callback`,
  //     },
  //   });

  //   if (error) {
  //     return redirect("/login?message=Could not authenticate user");
  //   }

  //   return redirect("/login?message=Check email to continue sign in process");
  // };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-4">
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
        {/* <div className="flex flex-col gap-2">
          <label className="text-md" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border"
            type="password"
            name="password"
            placeholder="••••••••"
          />
        </div> */}
        {/* <SubmitButton
          formAction={signIn}
          className="bg-green-700 rounded-md px-4 py-2 text-foreground"
          pendingText="Signing In..."
        >
          Sign In
        </SubmitButton> */}
        {/* <SubmitButton
          formAction={signUp}
          className="border border-foreground/20 rounded-md px-4 py-2 text-foreground"
          pendingText="Signing Up..."
        >
          Sign Up
        </SubmitButton> */}
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="24px"
            height="24px"
          >
            <path
              fill="#4285F4"
              d="M24 9.5c3.05 0 5.65 1.09 7.58 2.87L36.67 9c-3.03-2.88-7.05-4.5-12.67-4.5-9.15 0-16.5 7.35-16.5 16.5S14.85 37.5 24 37.5c4.91 0 9.27-1.73 12.27-4.65L31.5 27.75c-1.9 1.78-4.3 2.75-7.5 2.75-5.91 0-10.72-4.81-10.72-10.72S18.09 9.5 24 9.5z"
            />
            <path
              fill="#34A853"
              d="M11.25 24c0-1.73.47-3.35 1.3-4.75L7.87 15.98A16.505 16.505 0 004.5 24c0 2.62.63 5.09 1.77 7.25L12.6 20.25c-.84-1.4-1.35-3.02-1.35-4.75z"
            />
            <path
              fill="#FBBC05"
              d="M27.35 8.4a10.583 10.583 0 00-4.35-.9C15.91 7.5 11.5 11.91 11.5 17.5c0 3.07 1.29 5.89 3.38 7.88L7.25 36.5c-1.17-2.16-1.85-4.58-1.85-7.25s.69-5.09 1.87-7.25l5.13 5.88C16.27 24.69 17.09 24 18.15 24H24v5.5h4.35c.31 0 .61-.09.87-.23.27-.14.53-.32.76-.53.23-.21.45-.47.66-.74.21-.28.39-.6.54-.96.15-.35.27-.75.35-1.15.08-.4.12-.83.12-1.25v-4.35h-5.5V9.5z"
            />
            <path
              fill="#EA4335"
              d="M34.53 14.27a10.583 10.583 0 00-3.54-1.27c-.23-.05-.47-.09-.72-.12-.25-.03-.51-.05-.77-.05-3.03 0-5.55 1.28-7.27 3.3L24 15h5.5v5.5h-4.35c.41 1.16.65 2.41.65 3.75s-.24 2.59-.65 3.75h4.35v-5.5H24c-1.65 0-3.22.43-4.58 1.18L14.9 27.52C17.21 29.81 20.45 31 24 31c5.08 0 9.27-1.73 12.27-4.65L35 20.25c-1.73-1.72-3.97-2.88-6.47-3.47z"
            />
          </svg>
          Login with Google
        </SubmitButton>
        <SubmitButton
          formAction={signInWithFacebook}
          className="border border-foreground/20 rounded-md px-4 py-2 flex items-center justify-center gap-2 text-foreground"
          pendingText="Signing in with facebook..."
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="24px"
            height="24px"
          >
            <path
              fill="#1877F2"
              d="M23.99 1.95c-12.02 0-21.75 9.74-21.75 21.75 0 10.68 7.61 19.6 17.62 21.52v-15.2h-5.29v-6.32h5.29v-4.82c0-5.2 3.2-8.03 7.87-8.03 2.26 0 4.21.17 4.79.25v5.56l-3.28.01c-2.57 0-3.07 1.22-3.07 3.02v3.98h6.14l-.8 6.32h-5.34v15.25c10.08-2.01 17.62-10.89 17.62-21.52 0-12.02-9.74-21.75-21.75-21.75z"
            />
          </svg>
          Login with Facebook
        </SubmitButton>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
