// DELETE /api/campaigns/[id] — delete a campaign and its ad variations

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getSupabaseAdmin();

  // Delete ad variations first (FK constraint)
  await db.from("ad_variations").delete().eq("campaign_id", id);

  const { error } = await db.from("campaigns").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
