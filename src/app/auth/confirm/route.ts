import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"));

  // Only signup confirmation is supported by this screen. Password recovery
  // and email changes need their own explicitly designed user flows.
  if (tokenHash && (type === "signup" || type === "email")) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url), {
        headers: { "Cache-Control": "private, no-store" },
      });
    }
  }

  return NextResponse.redirect(new URL("/auth/erreur", request.url), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
