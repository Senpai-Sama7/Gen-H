import type { InquiryRecord } from "@/lib/types";

type NotificationResult = {
  status: "sent" | "skipped" | "failed";
  detail: string;
};

export async function notifyNewInquiry(record: InquiryRecord): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const alertEmail = process.env.ALERT_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || "GEN-H Studio <ops@updates.genh.studio>";

  if (!apiKey || !alertEmail) {
    return {
      status: "skipped",
      detail: "Email notifications are not configured. Set RESEND_API_KEY and ALERT_EMAIL to enable them."
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [alertEmail],
      subject: `New GEN-H inquiry from ${record.company}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h2 style="margin-bottom: 12px;">New inquiry captured</h2>
          <p><strong>Company:</strong> ${escapeHtml(record.company)}</p>
          <p><strong>Contact:</strong> ${escapeHtml(record.name)} (${escapeHtml(record.email)} / ${escapeHtml(record.phone)})</p>
          <p><strong>Project:</strong> ${escapeHtml(record.projectType)}</p>
          <p><strong>Budget:</strong> ${escapeHtml(record.budgetBand)}</p>
          <p><strong>Launch window:</strong> ${escapeHtml(record.launchWindow)}</p>
          <p><strong>Goals:</strong></p>
          <p>${escapeHtml(record.goals)}</p>
          <p><strong>Reference:</strong> ${escapeHtml(record.id)}</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const text = await response.text();

    return {
      status: "failed",
      detail: `Resend rejected the request (${response.status}): ${text}`
    };
  }

  return {
    status: "sent",
    detail: `Notification sent to ${alertEmail}.`
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
