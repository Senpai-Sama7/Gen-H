import { NextResponse } from "next/server";
import { z } from "zod";

import { updateInquiry } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["new", "qualified", "booked"]),
  notes: z.string().max(2000)
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const payload = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Request failed validation.",
        errors: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const snapshotPath = searchParams.get("snapshot") ?? undefined;
  const result = await updateInquiry(id, parsed.data, snapshotPath);

  if (!result) {
    return NextResponse.json(
      {
        success: false,
        message: "Inquiry not found."
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    record: result.record,
    snapshotPath: result.snapshotPath,
    message: "Inquiry updated."
  });
}
