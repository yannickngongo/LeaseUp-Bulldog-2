// GET /api/activity?operator_id=...&limit=20 — recent activity logs for an operator

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const operatorId = req.nextUrl.searchParams.get("operator_id");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");

  if (!operatorId) return NextResponse.json({ error: "operator_id required" }, { status: 400 });

  const db = getSupabaseAdmin();

  // Get property IDs for this operator
  const { data: properties } = await db
    .from("properties")
    .select("id")
    .eq("operator_id", operatorId);

  if (!properties?.length) return NextResponse.json({ activity: [] });

  const propertyIds = properties.map((p) => p.id);

  const { data, error } = await db
    .from("activity_logs")
    .select("id, created_at, action, actor, metadata, lead_id, property_id")
    .in("property_id", propertyIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ activity: data ?? [] });
}
