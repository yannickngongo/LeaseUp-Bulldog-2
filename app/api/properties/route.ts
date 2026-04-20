// GET /api/properties?email=... — list properties for an operator

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data: operator } = await db.from("operators").select("id").eq("email", email).single();
  if (!operator) return NextResponse.json({ properties: [] });

  const { data: properties } = await db
    .from("properties")
    .select("id, name, phone_number, address, city, state, zip, active_special, website_url")
    .eq("operator_id", operator.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ properties: properties ?? [] });
}
