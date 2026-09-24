"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getSiteUrl } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email().max(254);
const passwordSchema = z.string().min(12).max(128);

function authUrl(
  pathname: string,
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });

  return `${pathname}?${search.toString()}`;
}

export async function signIn(formData: FormData) {
  const credentials = z
    .object({
      email: emailSchema,
      password: z.string().min(1).max(128),
      next: z.string().optional(),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next") || undefined,
    });

  const next = safeRedirectPath(
    typeof formData.get("next") === "string"
      ? (formData.get("next") as string)
      : undefined,
  );

  if (!credentials.success) {
    redirect(
      authUrl("/auth/connexion", {
        erreur: "Vérifiez votre adresse e-mail et votre mot de passe.",
        next,
      }),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials.data);

  if (error) {
    console.warn("Échec de connexion Supabase", { code: error.code });
    redirect(
      authUrl("/auth/connexion", {
        erreur: "Connexion impossible. Vérifiez vos identifiants.",
        next,
      }),
    );
  }

  redirect(next);
}

export async function signUp(formData: FormData) {
  const registration = z
    .object({
      fullName: z.string().trim().min(2).max(100),
      email: emailSchema,
      password: passwordSchema,
    })
    .safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

  if (!registration.success) {
    redirect(
      authUrl("/auth/inscription", {
        erreur:
          "Vérifiez les informations. Le mot de passe doit contenir au moins 12 caractères.",
      }),
    );
  }

  const supabase = await createClient();
  const { fullName, email, password } = registration.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    console.warn("Échec d'inscription Supabase", { code: error.code });
    redirect(
      authUrl("/auth/inscription", {
        erreur: "Inscription impossible pour le moment. Réessayez plus tard.",
      }),
    );
  }

  redirect(data.session ? "/dashboard" : "/auth/confirmation");
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) {
    console.warn("Échec de déconnexion Supabase", { code: error.code });
    redirect("/auth/erreur");
  }
  redirect("/auth/connexion");
}
