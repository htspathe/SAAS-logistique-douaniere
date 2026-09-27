import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireOrganization } from "@/lib/organizations/server";
import { clientChoiceSchema, escapeClientSearch } from "@/lib/shipments/validation";

export async function GET(request: NextRequest) {
  const { supabase, membership } = await requireOrganization();
  const headers = { "Cache-Control": "private, no-store" };
  if (request.nextUrl.searchParams.get("organizationId") !== membership.organization_id) {
    return NextResponse.json({ error: "L’entreprise active a changé. Rechargez le formulaire." }, { status: 409, headers });
  }
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length > 160) return NextResponse.json({ error: "Recherche trop longue." }, { status: 400, headers });
  let lookup = supabase.from("clients").select("id, name").eq("organization_id", membership.organization_id);
  if (query) lookup = lookup.ilike("name", `%${escapeClientSearch(query)}%`);
  const { data, error } = await lookup.order("name").order("id").limit(21);
  if (error) return NextResponse.json({ error: "Recherche indisponible. Réessayez." }, { status: 503, headers });
  const rows = z.array(clientChoiceSchema).parse(data);
  return NextResponse.json({ clients: rows.slice(0, 20), hasMore: rows.length > 20 }, { headers });
}
