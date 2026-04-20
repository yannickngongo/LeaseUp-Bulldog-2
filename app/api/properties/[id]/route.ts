// DELETE /api/properties/[id] — delete a property and its related data

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getSupabaseAdmin();

  // Delete child records first
  await db.from("units").delete().eq("property_id", id);
  await db.from("ad_variations").delete().in(
    "campaign_id",
    (await db.from("campaigns").select("id").eq("property_id", id)).data?.map(c => c.id) ?? []
  );
  await db.from("campaigns").delete().eq("property_id", id);
  await db.from("leads").delete().eq("property_id", id);

  const { error } = await db.from("properties").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
