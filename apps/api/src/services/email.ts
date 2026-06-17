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
const FROM_ADDRESS   = 'SUMOSTA <orders@sumosta.com>';

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
              <p style="margin:0;font-size:32px;">✓</p>
              <h2 style="margin:8px 0 4px;color:#2C2417;font-size:22px;">Order Confirmed!</h2>
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
                  <td style="color:#8B7355;padding:4px 0;font-size:14px;">Tax (5%)</td>
                  <td style="color:#5C4A32;padding:4px 0;font-size:14px;text-align:right;">${formatPrice(order.tax)}</td>
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

export async function sendOrderConfirmation(
  order: OrderEmailData,
  apiKey: string,
): Promise<boolean> {
  const toEmail = order.guestEmail ?? order.userEmail;
  if (!toEmail) {
    console.error('[Email] No recipient for order confirmation:', order.orderNumber);
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    FROM_ADDRESS,
        to:      [toEmail],
        subject: `Order Confirmed — ${order.orderNumber} | SUMOSTA`,
        html:    buildOrderConfirmationHtml(order),
      }),
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

export async function sendPasswordReset(
  email: string,
  resetUrl: string,
  apiKey: string,
): Promise<boolean> {
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
                This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
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
    const response = await fetch(RESEND_API_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    FROM_ADDRESS,
        to:      [email],
        subject: 'Reset Your SUMOSTA Password',
        html,
      }),
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
