import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is updated, update the cookies for the request and response
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the cookies for the request and response
            request.cookies.set({
              name,
              value: "",
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("user_profile")
      .select("registration_complete")
      .eq("id", user?.id)
      .single();

    // Define protected routes
    // const protectedRoutes = ["/dashboard", "/mydocuments", "/payment"];
    // if (
    //   protectedRoutes.some((route) =>
    //     request.nextUrl.pathname.startsWith(route)
    //   )
    // ) {
    //   console.log(user, "user logged in?");
    //   // If no user is logged in, redirect to the login page
    //   if (!user) {
    //     return NextResponse.redirect(new URL("/login", request.url));
    //   } else if (user && !data?.registration_complete) {
    //     return NextResponse.redirect(new URL("/register", request.url));
    //   }

    //   return response;
    // }
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
