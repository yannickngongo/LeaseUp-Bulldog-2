// GET /api/conversations?leadId=... — fetch all messages for a lead

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const leadId = req.nextUrl.searchParams.get("leadId");
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("conversations")
    .select("id, created_at, direction, body, ai_generated, twilio_sid")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  return NextResponse.json({ messages: data ?? [] });
}
