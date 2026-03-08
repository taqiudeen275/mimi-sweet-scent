import nodemailer from "nodemailer";

function getTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   ?? "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export interface OrderEmailData {
  orderId:    string;
  customerEmail: string;
  customerName?: string;
  items: { name: string; variant: string; quantity: number; unitPrice: number }[];
  subtotal:      number;
  discountCode?:  string;
  discountAmount: number;
  totalAmount:   number;
  shippingAddress: { line1: string; city: string; country: string };
}

function formatGHS(pesewas: number) {
  return `GHS ${(pesewas / 100).toFixed(2)}`;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[email] SMTP not configured — skipping order confirmation email");
    return;
  }

  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0ece4;font-family:sans-serif;font-size:14px;color:#1a1a1a;">
        ${item.name} — ${item.variant}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f0ece4;font-family:sans-serif;font-size:14px;color:#1a1a1a;text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f0ece4;font-family:sans-serif;font-size:14px;color:#1a1a1a;text-align:right;">
        ${formatGHS(item.unitPrice * item.quantity)}
      </td>
    </tr>
  `).join("");

  const discountRow = data.discountCode && data.discountAmount > 0 ? `
    <tr>
      <td colspan="2" style="padding:6px 0;font-family:sans-serif;font-size:13px;color:#16a34a;">Discount (${data.discountCode})</td>
      <td style="padding:6px 0;font-family:sans-serif;font-size:13px;color:#16a34a;text-align:right;">−${formatGHS(data.discountAmount)}</td>
    </tr>
  ` : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;background:#faf7f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#111110;padding:32px 40px;text-align:center;">
          <p style="font-family:Georgia,serif;font-size:22px;color:#B8860B;letter-spacing:0.12em;text-transform:uppercase;margin:0;">
            Mimi's Sweet Scent
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="font-family:Georgia,serif;font-size:26px;font-weight:300;color:#1a1a1a;margin:0 0 8px;">
            Thank you${data.customerName ? `, ${data.customerName}` : ""}!
          </p>
          <p style="font-family:sans-serif;font-size:14px;color:#666;margin:0 0 32px;">
            Your order <strong>#${data.orderId.slice(-8).toUpperCase()}</strong> has been confirmed and is being prepared.
          </p>

          <!-- Items table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <thead>
              <tr style="border-bottom:2px solid #111110;">
                <th style="padding:8px 0;font-family:sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888;text-align:left;">Item</th>
                <th style="padding:8px 0;font-family:sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888;text-align:center;">Qty</th>
                <th style="padding:8px 0;font-family:sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888;text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
              ${discountRow}
              <tr>
                <td colspan="2" style="padding:12px 0 4px;font-family:sans-serif;font-size:13px;font-weight:700;color:#1a1a1a;border-top:2px solid #111110;">Total</td>
                <td style="padding:12px 0 4px;font-family:Georgia,serif;font-size:18px;color:#B8860B;text-align:right;border-top:2px solid #111110;">
                  ${formatGHS(data.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Shipping -->
          <div style="background:#faf7f0;padding:16px 20px;margin-bottom:32px;">
            <p style="font-family:sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888;margin:0 0 8px;">Shipping to</p>
            <p style="font-family:sans-serif;font-size:14px;color:#1a1a1a;margin:0;">
              ${data.shippingAddress.line1}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.country}
            </p>
          </div>

          <p style="font-family:sans-serif;font-size:13px;color:#888;margin:0;">
            Questions? Reply to this email or contact us at <a href="mailto:hello@mimissweetscent.com" style="color:#B8860B;">hello@mimissweetscent.com</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#111110;padding:20px 40px;text-align:center;">
          <p style="font-family:sans-serif;font-size:11px;color:rgba(255,255,255,0.35);margin:0;letter-spacing:0.08em;">
            © ${new Date().getFullYear()} Mimi's Sweet Scent. All rights reserved.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  const transport = getTransport();
  await transport.sendMail({
    from:    `"Mimi's Sweet Scent" <${process.env.SMTP_USER}>`,
    to:      data.customerEmail,
    subject: `Order Confirmed — #${data.orderId.slice(-8).toUpperCase()} | Mimi's Sweet Scent`,
    html,
  });
}
