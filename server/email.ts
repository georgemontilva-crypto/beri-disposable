/**
 * Email helper for transactional emails (wholesale approval / registration links).
 *
 * Strategy:
 *  - If RESEND_API_KEY is configured, send via the Resend HTTP API (works on
 *    Cloud Run / Railway with no extra native deps).
 *  - Otherwise, fall back to logging the email so the flow is fully testable in
 *    development. The actual SMTP/Resend credentials are configured at deploy
 *    time on Railway (see DEPLOY.md).
 *
 * Configure on Railway:
 *  - RESEND_API_KEY      (recommended)
 *  - EMAIL_FROM          e.g. "Beri Disposable <noreply@beridisposable.com>"
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Beri Disposable <noreply@beridisposable.com>";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; provider: string }> {
  // Resend HTTP API path
  if (RESEND_API_KEY) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [input.to],
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      });
      if (!resp.ok) {
        const detail = await resp.text().catch(() => resp.statusText);
        console.warn(`[Email] Resend failed (${resp.status}): ${detail}`);
        return { ok: false, provider: "resend" };
      }
      return { ok: true, provider: "resend" };
    } catch (err) {
      console.warn("[Email] Resend error:", err);
      return { ok: false, provider: "resend" };
    }
  }

  // Development fallback: log the email content.
  console.log("=== [Email:DEV fallback] ===");
  console.log("To:", input.to);
  console.log("Subject:", input.subject);
  console.log("HTML:", input.html);
  console.log("============================");
  return { ok: true, provider: "log" };
}

/** Build the wholesale approval email with a registration completion link. */
export function buildApprovalEmail(params: {
  name: string | null;
  registrationUrl: string;
}): { subject: string; html: string; text: string } {
  const greeting = params.name ? `Hi ${params.name},` : "Hello,";
  const subject = "Your Beri Disposable Wholesale account has been approved";
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; color:#111; max-width:560px; margin:0 auto;">
    <div style="background:#000; color:#fff; padding:24px; text-align:center; border-radius:16px 16px 0 0;">
      <h1 style="margin:0; letter-spacing:2px; font-size:24px;">BERI DISPOSABLE</h1>
    </div>
    <div style="padding:28px; border:1px solid #eee; border-top:none; border-radius:0 0 16px 16px;">
      <p style="font-size:16px;">${greeting}</p>
      <p style="font-size:15px; line-height:1.6; color:#333;">
        Great news — your wholesale application has been <strong>approved</strong>.
        To finish setting up your account, please create your password using the secure link below.
      </p>
      <p style="text-align:center; margin:28px 0;">
        <a href="${params.registrationUrl}"
           style="background:#000; color:#fff; text-decoration:none; padding:14px 28px; border-radius:9999px; font-weight:bold; display:inline-block;">
          Complete Registration
        </a>
      </p>
      <p style="font-size:13px; color:#777; line-height:1.6;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <span style="word-break:break-all;">${params.registrationUrl}</span>
      </p>
      <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
      <p style="font-size:12px; color:#999;">
        Questions? Contact us at wholesale@beridisposable.com
      </p>
      <p style="font-size:11px; color:#bbb;">
        WARNING: This product contains nicotine. Nicotine is an addictive chemical.
      </p>
    </div>
  </div>`;
  const text = `${greeting}\n\nYour wholesale application has been approved. Complete your registration here: ${params.registrationUrl}\n\nQuestions? wholesale@beridisposable.com`;
  return { subject, html, text };
}
