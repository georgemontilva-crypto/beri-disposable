import { describe, expect, it } from "vitest";
import { buildApprovalEmail, sendEmail } from "./email";

describe("approval email builder", () => {
  it("includes the registration url and greeting", () => {
    const { subject, html, text } = buildApprovalEmail({
      name: "Jane",
      registrationUrl: "https://beri.com/wholesale/complete?token=abc",
    });
    expect(subject).toMatch(/approved/i);
    expect(html).toContain("https://beri.com/wholesale/complete?token=abc");
    expect(html).toContain("Hi Jane");
    expect(text).toContain("https://beri.com/wholesale/complete?token=abc");
  });

  it("handles a null name gracefully", () => {
    const { html } = buildApprovalEmail({ name: null, registrationUrl: "https://x.com/c?token=t" });
    expect(html).toContain("Hello,");
  });
});

describe("sendEmail dev fallback", () => {
  it("returns ok via log provider when no RESEND_API_KEY", async () => {
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    });
    // In test env there is no RESEND_API_KEY so it falls back to logging.
    expect(result.ok).toBe(true);
    expect(result.provider).toBe("log");
  });
});
