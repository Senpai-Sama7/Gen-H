import { NextResponse } from "next/server";
import { z } from "zod";

import { createInquiry, getStorageMode, listInquiries } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

const inquirySchema = z.object({
  name: z.string().min(2).max(80),
  company: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  projectType: z.string().min(2).max(60),
  budgetBand: z.string().min(2).max(60),
  launchWindow: z.string().min(2).max(60),
  goals: z.string().min(20).max(1200)
});

export async function GET() {
  const records = await listInquiries(10);

  return NextResponse.json({
    success: true,
    storage: getStorageMode(),
    count: records.length,
    records
  });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(payload);

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

  try {
    const record = await createInquiry(parsed.data);

    return NextResponse.json(
      {
        success: true,
        storage: getStorageMode(),
        record,
        message: "Inquiry received. A strategist will reply within one business day."
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json(
      {
        success: false,
        message
      },
      { status: 503 }
    );
  }
}
