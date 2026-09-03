// ============================================================
// Email Service — Resend wrapper
// ============================================================

interface OrderEmailItem {
  productName: string;
  variantName: string | null;
  quantity:    number;
  unitPrice:   number;
  lineTotal:   number;
}

interface OrderEmailData {
  id:                    string;
  orderNumber:           string;
  guestEmail?:           string | null;
  userEmail?:            string | null;
  shippingName:          string;
  shippingAddressLine1:  string;
  shippingAddressLine2?: string | null;
  shippingCity:          string;
  shippingState:         string;
  shippingPincode:       string;
  subtotal:              number;
  discount:              number;
  shippingAmount:        number;
  tax:                   number;
  total:                 number;
  couponCode?:           string | null;
  estimatedDeliveryDate?: string | null;
  items:                 OrderEmailItem[];
}

const RESEND_API_URL = 'https://api.resend.com/emails';

function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildOrderItemsHtml(items: OrderEmailItem[]): string {
  return items.map((item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #F0E6D3;">
        <strong style="color:#2C2417;">${item.productName}</strong>
        ${item.variantName ? `<br><span style="font-size:13px;color:#8B7355;">${item.variantName}</span>` : ''}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #F0E6D3;text-align:center;color:#5C4A32;">
        x${item.quantity}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #F0E6D3;text-align:right;color:#D4891A;font-weight:600;">
        ${formatPrice(item.lineTotal)}
      </td>
    </tr>
  `).join('');
}

function buildOrderConfirmationHtml(order: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed — SUMOSTA</title>
</head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF8;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(44,36,23,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1A150E;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#F5A623;font-size:28px;letter-spacing:0.05em;">SUMOSTA</h1>
              <p style="margin:8px 0 0;color:#C4B39A;font-size:13px;letter-spacing:0.1em;">NATURE'S GOLDEN PROMISE</p>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="background:#FFF0D6;padding:24px 40px;text-align:center;border-bottom:2px solid #FFCC66;">
              <h2 style="margin:0 0 4px;color:#2C2417;font-size:22px;">Order confirmed</h2>
              <p style="margin:0;color:#8B7355;font-size:14px;">Order ${order.orderNumber}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;color:#5C4A32;font-size:15px;line-height:1.6;">
                Thank you for your order, ${order.shippingName}! We're preparing your honey with care.
                ${order.estimatedDeliveryDate
                  ? `Your order is estimated to arrive by <strong>${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.`
                  : 'We will notify you once your order ships.'}
              </p>

              <!-- Order Items -->
              <h3 style="margin:0 0 16px;color:#2C2417;font-size:16px;border-bottom:2px solid #F5A623;padding-bottom:8px;">Order Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="text-align:left;color:#8B7355;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;">Product</th>
                    <th style="text-align:center;color:#8B7355;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;">Qty</th>
                    <th style="text-align:right;color:#8B7355;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildOrderItemsHtml(order.items)}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="color:#8B7355;padding:4px 0;font-size:14px;">Subtotal</td>
                  <td style="color:#5C4A32;padding:4px 0;font-size:14px;text-align:right;">${formatPrice(order.subtotal)}</td>
                </tr>
                ${order.discount > 0 ? `
                <tr>
                  <td style="color:#7C9A6E;padding:4px 0;font-size:14px;">Discount ${order.couponCode ? `(${order.couponCode})` : ''}</td>
                  <td style="color:#7C9A6E;padding:4px 0;font-size:14px;text-align:right;">−${formatPrice(order.discount)}</td>
                </tr>` : ''}
                <tr>
                  <td style="color:#8B7355;padding:4px 0;font-size:14px;">Shipping</td>
                  <td style="color:#5C4A32;padding:4px 0;font-size:14px;text-align:right;">${order.shippingAmount === 0 ? '<span style="color:#7C9A6E;">FREE</span>' : formatPrice(order.shippingAmount)}</td>
                </tr>
                <tr>
                  <td style="color:#8B7355;padding:4px 0;font-size:12px;font-style:italic;">Includes GST 5%</td>
                  <td style="color:#8B7355;padding:4px 0;font-size:12px;text-align:right;font-style:italic;">${formatPrice(Math.round((order.total / 1.05) * 0.05 * 100) / 100)}</td>
                </tr>
                <tr style="border-top:2px solid #F5A623;">
                  <td style="color:#2C2417;padding:12px 0 4px;font-size:16px;font-weight:700;">Total</td>
                  <td style="color:#D4891A;padding:12px 0 4px;font-size:18px;font-weight:700;text-align:right;">${formatPrice(order.total)}</td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <h3 style="margin:24px 0 12px;color:#2C2417;font-size:16px;border-bottom:2px solid #F5A623;padding-bottom:8px;">Shipping To</h3>
              <p style="margin:0;color:#5C4A32;font-size:14px;line-height:1.8;">
                ${order.shippingName}<br>
                ${order.shippingAddressLine1}${order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ''}<br>
                ${order.shippingCity}, ${order.shippingState} — ${order.shippingPincode}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#FFF9F0;padding:24px 40px;text-align:center;border-top:1px solid #F0E6D3;">
              <p style="margin:0 0 8px;color:#8B7355;font-size:13px;">
                Questions? Reply to this email or contact us at <a href="mailto:support@sumosta.com" style="color:#F5A623;">support@sumosta.com</a>
              </p>
              <p style="margin:0;color:#C4B39A;font-size:12px;">© ${new Date().getFullYear()} SUMOSTA. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface EmailAttachment {
  filename: string;
  content:  string;   // base64-encoded
  contentType?: string;
}

export async function sendOrderConfirmation(
  order: OrderEmailData,
  apiKey: string,
  fromAddress: string = 'SUMOSTA <orders@sumosta.com>',
  replyTo?: string | null,
  attachments?: EmailAttachment[],
): Promise<boolean> {
  const toEmail = order.guestEmail ?? order.userEmail;
  if (!toEmail) {
    console.error('[Email] No recipient for order confirmation:', order.orderNumber);
    return false;
  }

  try {
    const body: Record<string, unknown> = {
      from:    fromAddress,
      to:      [toEmail],
      subject: `Order Confirmed — ${order.orderNumber} | SUMOSTA`,
      html:    buildOrderConfirmationHtml(order),
    };
    if (replyTo) body.reply_to = replyTo;
    if (attachments && attachments.length > 0) {
      // Resend accepts { filename, content } where content is base64 for binary data.
      body.attachments = attachments.map((a) => ({
        filename: a.filename,
        content:  a.content,
      }));
    }
    const response = await fetch(RESEND_API_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Email] Resend API error:', response.status, err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Email] sendOrderConfirmation failed:', err);
    return false;
  }
}

interface ShippingUpdateData {
  orderNumber:     string;
  recipientEmail:  string;
  shippingName:    string;
  trackingNumber?: string | null;
  trackingUrl?:    string | null;
  courier?:        string | null;
  estimatedDate?:  string | null;
}

function buildShippedHtml(order: ShippingUpdateData): string {
  const etaLine = order.estimatedDate
    ? `<p style="margin:0 0 24px;color:#5C4A32;font-size:15px;line-height:1.6;">Estimated delivery: <strong>${new Date(order.estimatedDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</strong></p>`
    : '';
  const trackingBlock = order.trackingNumber
    ? `
      <div style="background:#FFF9F0;border:1px solid #F0E6D3;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;color:#8B7355;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Tracking Number</p>
        <p style="margin:0 0 8px;color:#2C2417;font-size:16px;font-weight:700;">${order.trackingNumber}</p>
        ${order.courier ? `<p style="margin:0 0 12px;color:#5C4A32;font-size:13px;">Courier: ${order.courier}</p>` : ''}
        ${order.trackingUrl ? `<a href="${order.trackingUrl}" style="display:inline-block;background:#F5A623;color:#1A150E;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">Track your package →</a>` : ''}
      </div>`
    : '';
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Your order has shipped — SUMOSTA</title></head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(44,36,23,0.08);">
        <tr><td style="background:#1A150E;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#F5A623;font-size:28px;letter-spacing:0.05em;">SUMOSTA</h1>
        </td></tr>
        <tr><td style="background:#FFF0D6;padding:24px 40px;text-align:center;border-bottom:2px solid #FFCC66;">
          <h2 style="margin:0 0 4px;color:#2C2417;font-size:22px;">Your order is on the way</h2>
          <p style="margin:0;color:#8B7355;font-size:14px;">Order ${order.orderNumber}</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;color:#5C4A32;font-size:15px;line-height:1.6;">
            Hi ${order.shippingName}, great news — your SUMOSTA order has left our warehouse.
          </p>
          ${etaLine}
          ${trackingBlock}
          <p style="margin:0;color:#8B7355;font-size:13px;line-height:1.5;">
            Keep this email for your records. If you have any questions, reply to this message or reach us at
            <a href="mailto:support@sumosta.com" style="color:#F5A623;">support@sumosta.com</a>.
          </p>
        </td></tr>
        <tr><td style="background:#FFF9F0;padding:20px 40px;text-align:center;border-top:1px solid #F0E6D3;">
          <p style="margin:0;color:#C4B39A;font-size:12px;">© ${new Date().getFullYear()} SUMOSTA. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildDeliveredHtml(order: ShippingUpdateData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Delivered — SUMOSTA</title></head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(44,36,23,0.08);">
        <tr><td style="background:#1A150E;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#F5A623;font-size:28px;letter-spacing:0.05em;">SUMOSTA</h1>
        </td></tr>
        <tr><td style="background:#EAF6E4;padding:24px 40px;text-align:center;border-bottom:2px solid #7C9A6E;">
          <h2 style="margin:0 0 4px;color:#2C2417;font-size:22px;">Delivered — enjoy</h2>
          <p style="margin:0;color:#5C8A4E;font-size:14px;">Order ${order.orderNumber}</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 20px;color:#5C4A32;font-size:15px;line-height:1.6;">
            Hi ${order.shippingName}, your SUMOSTA order has been delivered. We hope you love it.
          </p>
          <p style="margin:0 0 24px;color:#5C4A32;font-size:15px;line-height:1.6;">
            Enjoyed it? A short review helps other honey lovers discover us.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background:#F5A623;border-radius:8px;text-align:center;">
              <a href="https://sumosta.com/track?order=${encodeURIComponent(order.orderNumber)}" style="display:inline-block;padding:14px 32px;color:#1A150E;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.03em;">
                Leave a review
              </a>
            </td></tr>
          </table>
          <p style="margin:0;color:#8B7355;font-size:13px;line-height:1.5;">
            Anything not quite right? Reply to this email or reach us at
            <a href="mailto:support@sumosta.com" style="color:#F5A623;">support@sumosta.com</a> within 7 days.
          </p>
        </td></tr>
        <tr><td style="background:#FFF9F0;padding:20px 40px;text-align:center;border-top:1px solid #F0E6D3;">
          <p style="margin:0;color:#C4B39A;font-size:12px;">© ${new Date().getFullYear()} SUMOSTA. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendResendEmail(
  to: string, subject: string, html: string, apiKey: string, fromAddress: string,
  replyTo?: string | null,
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = { from: fromAddress, to: [to], subject, html };
    if (replyTo) body.reply_to = replyTo;
    const response = await fetch(RESEND_API_URL, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    if (!response.ok) {
      console.error('[Email] Resend API error:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] send failed:', err);
    return false;
  }
}

export async function sendOrderShipped(
  order: ShippingUpdateData,
  apiKey: string,
  fromAddress: string = 'SUMOSTA <orders@sumosta.com>',
  replyTo?: string | null,
): Promise<boolean> {
  return sendResendEmail(
    order.recipientEmail,
    `Your order ${order.orderNumber} has shipped — SUMOSTA`,
    buildShippedHtml(order),
    apiKey,
    fromAddress,
    replyTo,
  );
}

export async function sendOrderDelivered(
  order: ShippingUpdateData,
  apiKey: string,
  fromAddress: string = 'SUMOSTA <orders@sumosta.com>',
  replyTo?: string | null,
): Promise<boolean> {
  return sendResendEmail(
    order.recipientEmail,
    `Delivered: your SUMOSTA order ${order.orderNumber}`,
    buildDeliveredHtml(order),
    apiKey,
    fromAddress,
    replyTo,
  );
}

function buildPasswordResetText(resetUrl: string): string {
  return [
    'Reset Your SUMOSTA Password',
    '',
    'We received a request to reset the password for your SUMOSTA account.',
    'Open the link below in your browser to create a new password:',
    '',
    resetUrl,
    '',
    'This link will expire in 30 minutes. If you did not request a password reset,',
    'you can safely ignore this email.',
    '',
    '© ' + new Date().getFullYear() + ' SUMOSTA',
  ].join('\n');
}

export async function sendPasswordReset(
  email: string,
  resetUrl: string,
  apiKey: string,
  fromAddress: string = 'SUMOSTA <no-reply@sumosta.com>',
  replyTo?: string | null,
): Promise<boolean> {
  const text = buildPasswordResetText(resetUrl);
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password — SUMOSTA</title>
</head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF8;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(44,36,23,0.08);">

          <tr>
            <td style="background:#1A150E;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#F5A623;font-size:24px;letter-spacing:0.05em;">SUMOSTA</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#2C2417;font-size:22px;">Reset Your Password</h2>
              <p style="margin:0 0 24px;color:#5C4A32;font-size:15px;line-height:1.6;">
                We received a request to reset the password for your SUMOSTA account. Click the button below to create a new password.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background:#F5A623;border-radius:8px;text-align:center;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 32px;color:#1A150E;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.03em;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#8B7355;font-size:13px;line-height:1.5;">
                This link will expire in <strong>30 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
              </p>
              <p style="margin:0;color:#C4B39A;font-size:12px;word-break:break-all;">
                Or copy and paste this URL: ${resetUrl}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#FFF9F0;padding:20px 40px;text-align:center;border-top:1px solid #F0E6D3;">
              <p style="margin:0;color:#C4B39A;font-size:12px;">© ${new Date().getFullYear()} SUMOSTA. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const body: Record<string, unknown> = {
      from:    fromAddress,
      to:      [email],
      subject: 'Reset Your SUMOSTA Password',
      html,
      text,
    };
    if (replyTo) body.reply_to = replyTo;
    const response = await fetch(RESEND_API_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Email] Resend API error:', response.status, err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Email] sendPasswordReset failed:', err);
    return false;
  }
}

// Named per API contract in CLAUDE.md — thin alias over sendPasswordReset.
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  apiKey: string,
  fromAddress?: string,
  replyTo?: string | null,
): Promise<boolean> {
  return sendPasswordReset(email, resetUrl, apiKey, fromAddress, replyTo);
}

// ============================================================
// CONTACT FORM — admin notification + customer ack
// ============================================================

interface ContactPayload {
  name:    string;
  email:   string;
  phone?:  string | null;
  subject?: string | null;
  message: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildContactNotificationHtml(p: ContactPayload): string {
  const phoneLine = p.phone
    ? `<tr><td style="color:#8B7355;padding:6px 0;font-size:13px;width:120px;">Phone</td><td style="color:#2C2417;padding:6px 0;font-size:14px;">${escapeHtml(p.phone)}</td></tr>`
    : '';
  const subjectLine = p.subject
    ? `<tr><td style="color:#8B7355;padding:6px 0;font-size:13px;width:120px;">Subject</td><td style="color:#2C2417;padding:6px 0;font-size:14px;">${escapeHtml(p.subject)}</td></tr>`
    : '';
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Contact Message — SUMOSTA</title></head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(44,36,23,0.08);">
        <tr><td style="background:#1A150E;padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#F5A623;font-size:24px;letter-spacing:0.05em;">SUMOSTA</h1>
          <p style="margin:6px 0 0;color:#C4B39A;font-size:12px;letter-spacing:0.1em;">NEW CONTACT MESSAGE</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h2 style="margin:0 0 20px;color:#2C2417;font-size:20px;border-bottom:2px solid #F5A623;padding-bottom:10px;">Sender Details</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="color:#8B7355;padding:6px 0;font-size:13px;width:120px;">Name</td><td style="color:#2C2417;padding:6px 0;font-size:14px;">${escapeHtml(p.name)}</td></tr>
            <tr><td style="color:#8B7355;padding:6px 0;font-size:13px;width:120px;">Email</td><td style="color:#2C2417;padding:6px 0;font-size:14px;"><a href="mailto:${escapeHtml(p.email)}" style="color:#D4891A;text-decoration:none;">${escapeHtml(p.email)}</a></td></tr>
            ${phoneLine}
            ${subjectLine}
          </table>
          <h2 style="margin:0 0 12px;color:#2C2417;font-size:20px;border-bottom:2px solid #F5A623;padding-bottom:10px;">Message</h2>
          <div style="background:#FFF9F0;border:1px solid #F0E6D3;border-radius:8px;padding:16px;color:#5C4A32;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(p.message)}</div>
          <p style="margin:20px 0 0;color:#8B7355;font-size:13px;line-height:1.5;">
            Reply directly to this email to respond to ${escapeHtml(p.name)}.
          </p>
        </td></tr>
        <tr><td style="background:#FFF9F0;padding:20px 40px;text-align:center;border-top:1px solid #F0E6D3;">
          <p style="margin:0;color:#C4B39A;font-size:12px;">© ${new Date().getFullYear()} SUMOSTA. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildContactAckHtml(p: ContactPayload): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>We've received your message — SUMOSTA</title></head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(44,36,23,0.08);">
        <tr><td style="background:#1A150E;padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#F5A623;font-size:24px;letter-spacing:0.05em;">SUMOSTA</h1>
          <p style="margin:6px 0 0;color:#C4B39A;font-size:12px;letter-spacing:0.1em;">NATURE'S GOLDEN PROMISE</p>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <h2 style="margin:0 0 16px;color:#2C2417;font-size:22px;">Thanks for reaching out, ${escapeHtml(p.name)}</h2>
          <p style="margin:0 0 20px;color:#5C4A32;font-size:15px;line-height:1.6;">
            We've received your message and one of our team members will get back to you within <strong>24 hours</strong>.
          </p>
          <div style="background:#FFF9F0;border:1px solid #F0E6D3;border-radius:8px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 8px;color:#8B7355;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Your message</p>
            <div style="color:#5C4A32;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(p.message)}</div>
          </div>
          <p style="margin:0;color:#8B7355;font-size:13px;line-height:1.5;">
            In the meantime, feel free to explore our <a href="https://sumosta.com/shop" style="color:#D4891A;text-decoration:none;font-weight:600;">collection</a>.
          </p>
        </td></tr>
        <tr><td style="background:#FFF9F0;padding:20px 40px;text-align:center;border-top:1px solid #F0E6D3;">
          <p style="margin:0;color:#C4B39A;font-size:12px;">© ${new Date().getFullYear()} SUMOSTA. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendContactNotification(
  payload: ContactPayload,
  toAdmin: string,
  apiKey: string,
  fromAddress: string = 'SUMOSTA <no-reply@sumosta.com>',
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {
      from:    fromAddress,
      to:      [toAdmin],
      subject: `New contact message: ${payload.subject || payload.name}`,
      html:    buildContactNotificationHtml(payload),
      reply_to: payload.email,
    };
    const response = await fetch(RESEND_API_URL, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    if (!response.ok) {
      console.error('[Email] sendContactNotification error:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] sendContactNotification failed:', err);
    return false;
  }
}

export async function sendContactAck(
  payload: ContactPayload,
  apiKey: string,
  fromAddress: string = 'SUMOSTA <no-reply@sumosta.com>',
  replyTo?: string | null,
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {
      from:    fromAddress,
      to:      [payload.email],
      subject: "We've received your message — SUMOSTA",
      html:    buildContactAckHtml(payload),
    };
    if (replyTo) body.reply_to = replyTo;
    const response = await fetch(RESEND_API_URL, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    if (!response.ok) {
      console.error('[Email] sendContactAck error:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] sendContactAck failed:', err);
    return false;
  }
}

// ============================================================
// NEWSLETTER — confirmation (double-opt-in), welcome, marketing helper
// ============================================================

function unsubscribeFooterHtml(unsubUrl: string): string {
  return `
    <p style="margin:16px 0 0;color:#C4B39A;font-size:12px;line-height:1.5;">
      You're receiving this because you subscribed to SUMOSTA updates.
      <a href="${unsubUrl}" style="color:#8B7355;text-decoration:underline;">Unsubscribe</a> at any time.
    </p>`;
}

function buildNewsletterConfirmationHtml(confirmUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Confirm your subscription — SUMOSTA</title></head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(44,36,23,0.08);">
        <tr><td style="background:#1A150E;padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#F5A623;font-size:24px;letter-spacing:0.05em;">SUMOSTA</h1>
          <p style="margin:6px 0 0;color:#C4B39A;font-size:12px;letter-spacing:0.1em;">NATURE'S GOLDEN PROMISE</p>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <h2 style="margin:0 0 16px;color:#2C2417;font-size:22px;">One quick step</h2>
          <p style="margin:0 0 24px;color:#5C4A32;font-size:15px;line-height:1.6;">
            Please confirm your email to join the SUMOSTA newsletter. You'll be the first to know about new harvests, seasonal releases, and subscriber-only offers.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background:#F5A623;border-radius:8px;text-align:center;">
              <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;color:#1A150E;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.03em;">
                Confirm my email
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;color:#8B7355;font-size:13px;line-height:1.5;">
            If you didn't ask to subscribe, you can safely ignore this email.
          </p>
          <p style="margin:0;color:#C4B39A;font-size:12px;word-break:break-all;">
            Or copy this URL: ${confirmUrl}
          </p>
        </td></tr>
        <tr><td style="background:#FFF9F0;padding:20px 40px;text-align:center;border-top:1px solid #F0E6D3;">
          <p style="margin:0;color:#C4B39A;font-size:12px;">© ${new Date().getFullYear()} SUMOSTA. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildNewsletterWelcomeHtml(discountCode: string, unsubUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Welcome to SUMOSTA</title></head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(44,36,23,0.08);">
        <tr><td style="background:#1A150E;padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#F5A623;font-size:24px;letter-spacing:0.05em;">SUMOSTA</h1>
          <p style="margin:6px 0 0;color:#C4B39A;font-size:12px;letter-spacing:0.1em;">NATURE'S GOLDEN PROMISE</p>
        </td></tr>
        <tr><td style="background:#FFF0D6;padding:24px 40px;text-align:center;border-bottom:2px solid #FFCC66;">
          <h2 style="margin:0 0 6px;color:#2C2417;font-size:24px;">Welcome to the colony</h2>
          <p style="margin:0;color:#8B7355;font-size:14px;">Thanks for confirming your email.</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 20px;color:#5C4A32;font-size:15px;line-height:1.6;">
            As a thank you, here's <strong>10% off</strong> your first order. Use the code below at checkout.
          </p>
          <div style="background:#FFF9F0;border:2px dashed #F5A623;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 6px;color:#8B7355;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Your code</p>
            <p style="margin:0;color:#D4891A;font-size:26px;font-weight:700;letter-spacing:0.15em;">${escapeHtml(discountCode)}</p>
          </div>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background:#F5A623;border-radius:8px;text-align:center;">
              <a href="https://sumosta.com/shop" style="display:inline-block;padding:14px 32px;color:#1A150E;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.03em;">
                Shop the collection
              </a>
            </td></tr>
          </table>
          <p style="margin:0;color:#8B7355;font-size:13px;line-height:1.5;">
            Expect a few thoughtful emails a month — new harvests, recipes, and quiet news from the hive. Nothing more.
          </p>
          ${unsubscribeFooterHtml(unsubUrl)}
        </td></tr>
        <tr><td style="background:#FFF9F0;padding:20px 40px;text-align:center;border-top:1px solid #F0E6D3;">
          <p style="margin:0;color:#C4B39A;font-size:12px;">© ${new Date().getFullYear()} SUMOSTA. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendNewsletterConfirmation(
  email: string,
  confirmUrl: string,
  apiKey: string,
  fromAddress: string = 'SUMOSTA <no-reply@sumosta.com>',
): Promise<boolean> {
  try {
    const response = await fetch(RESEND_API_URL, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        from:    fromAddress,
        to:      [email],
        subject: 'Confirm your SUMOSTA subscription',
        html:    buildNewsletterConfirmationHtml(confirmUrl),
      }),
    });
    if (!response.ok) {
      console.error('[Email] sendNewsletterConfirmation error:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] sendNewsletterConfirmation failed:', err);
    return false;
  }
}

export async function sendNewsletterWelcome(
  email: string,
  unsubToken: string,
  apiKey: string,
  baseUrl: string,
  fromAddress: string = 'SUMOSTA <no-reply@sumosta.com>',
  discountCode: string = 'WELCOME10',
): Promise<boolean> {
  const unsubUrl = `${baseUrl.replace(/\/$/, '')}/api/newsletter/unsubscribe/${unsubToken}`;
  return sendMarketingEmail({
    to:          email,
    unsubToken,
    subject:     'Welcome to SUMOSTA — here is your 10% off',
    html:        buildNewsletterWelcomeHtml(discountCode, unsubUrl),
    apiKey,
    baseUrl,
    fromAddress,
  });
}

// Generic marketing send helper — automatically adds the RFC-8058
// List-Unsubscribe headers and the visible footer link. Call this for every
// marketing/newsletter/broadcast email; never for transactional messages.
export async function sendMarketingEmail(opts: {
  to:          string;
  unsubToken:  string;
  subject:     string;
  html:        string;                    // pass HTML that already contains the footer link (or omit and let the helper append one)
  apiKey:      string;
  baseUrl:     string;
  fromAddress?: string;
  replyTo?:    string | null;
  appendFooter?: boolean;                 // default false — assumes template already includes footer
}): Promise<boolean> {
  const from = opts.fromAddress ?? 'SUMOSTA <no-reply@sumosta.com>';
  const unsubUrl = `${opts.baseUrl.replace(/\/$/, '')}/api/newsletter/unsubscribe/${opts.unsubToken}`;

  let html = opts.html;
  if (opts.appendFooter) {
    html = html.replace(/<\/body>/i, `${unsubscribeFooterHtml(unsubUrl)}</body>`);
  }

  try {
    const body: Record<string, unknown> = {
      from,
      to:      [opts.to],
      subject: opts.subject,
      html,
      headers: {
        'List-Unsubscribe':      `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    };
    if (opts.replyTo) body.reply_to = opts.replyTo;

    const response = await fetch(RESEND_API_URL, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${opts.apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    if (!response.ok) {
      console.error('[Email] sendMarketingEmail error:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] sendMarketingEmail failed:', err);
    return false;
  }
}

// ============================================================
// CART RECOVERY EMAIL
// ============================================================

export interface CartRecoveryItem {
  productName: string;
  variantName?: string | null;
  quantity:    number;
  unitPrice:   number;
  lineTotal:   number;
  imageUrl?:   string | null;
}

export interface CartRecoveryData {
  email:     string;
  name?:     string | null;
  items:     CartRecoveryItem[];
  cartTotal: number;
  resumeUrl: string;
}

function buildRecoveryItemsHtml(items: CartRecoveryItem[]): string {
  return items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F0E6D3;">
        <strong style="color:#2C2417;">${item.productName}</strong>
        ${item.variantName ? `<br><span style="font-size:13px;color:#8B7355;">${item.variantName}</span>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #F0E6D3;text-align:center;color:#5C4A32;">
        x${item.quantity}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #F0E6D3;text-align:right;color:#D4891A;font-weight:600;">
        ${formatPrice(item.lineTotal)}
      </td>
    </tr>
  `).join('');
}

function buildCartRecoveryHtml(data: CartRecoveryData): string {
  const greeting = data.name && data.name.trim().length > 0
    ? `Hi ${data.name.trim()},`
    : 'Hi,';
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SUMOSTA cart is waiting</title>
</head>
<body style="margin:0;padding:0;background:#FFFDF8;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF8;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(44,36,23,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1A150E;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#F5A623;font-size:28px;letter-spacing:0.05em;">SUMOSTA</h1>
              <p style="margin:8px 0 0;color:#C4B39A;font-size:13px;letter-spacing:0.1em;">NATURE'S GOLDEN PROMISE</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 8px;">
              <h2 style="margin:0 0 12px;color:#2C2417;font-size:22px;">Your cart is still waiting.</h2>
              <p style="margin:0 0 20px;color:#5C4A32;font-size:15px;line-height:1.6;">
                ${greeting} we saved the items you added at SUMOSTA. Pick up right where you left off — everything is still in stock and ready to ship.
              </p>

              <!-- Items -->
              <h3 style="margin:24px 0 12px;color:#2C2417;font-size:15px;border-bottom:2px solid #F5A623;padding-bottom:8px;">Your Selection</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="text-align:left;color:#8B7355;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;">Product</th>
                    <th style="text-align:center;color:#8B7355;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;">Qty</th>
                    <th style="text-align:right;color:#8B7355;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:8px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildRecoveryItemsHtml(data.items)}
                </tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                <tr style="border-top:2px solid #F5A623;">
                  <td style="color:#2C2417;padding:12px 0 4px;font-size:15px;font-weight:700;">Cart Total</td>
                  <td style="color:#D4891A;padding:12px 0 4px;font-size:18px;font-weight:700;text-align:right;">${formatPrice(data.cartTotal)}</td>
                </tr>
              </table>

              <!-- Single CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:28px auto 8px;">
                <tr>
                  <td style="background:#F5A623;border-radius:8px;text-align:center;">
                    <a href="${data.resumeUrl}"
                       style="display:inline-block;padding:14px 32px;color:#1A150E;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.03em;">
                      Complete your order
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:12px 0 0;color:#C4B39A;font-size:12px;text-align:center;word-break:break-all;">
                Or paste this link: ${data.resumeUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#FFF9F0;padding:24px 40px;text-align:center;border-top:1px solid #F0E6D3;">
              <p style="margin:0 0 8px;color:#8B7355;font-size:13px;">
                Questions? Reply to this email or contact us at <a href="mailto:support@sumosta.com" style="color:#F5A623;">support@sumosta.com</a>
              </p>
              <p style="margin:0;color:#C4B39A;font-size:12px;">© ${new Date().getFullYear()} SUMOSTA. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendCartRecovery(
  data: CartRecoveryData,
  apiKey: string,
  fromAddress: string = 'SUMOSTA <orders@sumosta.com>',
  replyTo?: string | null,
): Promise<boolean> {
  return sendResendEmail(
    data.email,
    'Your SUMOSTA cart is waiting for you',
    buildCartRecoveryHtml(data),
    apiKey,
    fromAddress,
    replyTo,
  );
}
