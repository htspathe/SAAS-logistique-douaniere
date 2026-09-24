import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getSupabaseConfig } from "@/lib/supabase/config";

function transferSessionHeaders(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }

  return target;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseConfig();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = transferSessionHeaders(response, NextResponse.next({ request }));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) =>
          response.headers.set(name, value),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");
  const isAuthenticated = Boolean(data?.claims?.sub);
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthForm = ["/auth/connexion", "/auth/inscription"].includes(
    request.nextUrl.pathname,
  );

  if (isDashboard && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/connexion";
    loginUrl.search = "";
    loginUrl.searchParams.set(
      "next",
      safeRedirectPath(`${request.nextUrl.pathname}${request.nextUrl.search}`),
    );

    return transferSessionHeaders(response, NextResponse.redirect(loginUrl));
  }

  if (isAuthForm && isAuthenticated) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";

    return transferSessionHeaders(
      response,
      NextResponse.redirect(dashboardUrl),
    );
  }

  return response;
}
