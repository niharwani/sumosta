// ============================================================
// PhonePe Payment Service
// Uses crypto.subtle (Web Crypto API) — compatible with Cloudflare Workers
// ============================================================

interface PhonePePayRequest {
  merchantId:            string;
  merchantTransactionId: string;
  merchantUserId:        string;
  amount:                number;   // in paise
  redirectUrl:           string;
  redirectMode:          'REDIRECT';
  callbackUrl:           string;
  paymentInstrument:     { type: 'PAY_PAGE' };
}

async function sha256Hex(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export class PhonePeService {
  constructor(
    private merchantId:  string,
    private saltKey:     string,
    private saltIndex:   string,
    private baseUrl:     string,
  ) {}

  // ── Checksum: SHA256(base64Payload + endpoint + saltKey) + "###" + saltIndex
  private async generateChecksum(payload: string, endpoint: string): Promise<string> {
    const hash = await sha256Hex(payload + endpoint + this.saltKey);
    return `${hash}###${this.saltIndex}`;
  }

  // ── Initiate payment — returns { merchantTransactionId, paymentUrl }
  async initiatePayment(params: {
    orderId:     string;
    userId:      string;
    amount:      number;   // INR rupees
    redirectUrl: string;
    callbackUrl: string;
  }): Promise<{ merchantTransactionId: string; paymentUrl: string }> {
    const merchantTransactionId =
      `SUMO${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const payload: PhonePePayRequest = {
      merchantId:            this.merchantId,
      merchantTransactionId,
      merchantUserId:        params.userId,
      amount:                Math.round(params.amount * 100),   // paise
      redirectUrl:           params.redirectUrl,
      redirectMode:          'REDIRECT',
      callbackUrl:           params.callbackUrl,
      paymentInstrument:     { type: 'PAY_PAGE' },
    };

    const base64Payload = btoa(JSON.stringify(payload));
    const checksum      = await this.generateChecksum(base64Payload, '/pg/v1/pay');

    const response = await fetch(`${this.baseUrl}/pg/v1/pay`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY':     checksum,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json<{
      success: boolean;
      message?: string;
      data?: { instrumentResponse?: { redirectInfo?: { url: string } } };
    }>();

    if (!data.success) {
      throw new Error(`PhonePe init failed: ${data.message ?? 'Unknown error'}`);
    }

    const paymentUrl = data.data?.instrumentResponse?.redirectInfo?.url;
    if (!paymentUrl) {
      throw new Error('PhonePe did not return a payment URL');
    }

    return { merchantTransactionId, paymentUrl };
  }

  // ── Verify S2S callback checksum
  // PhonePe sends: X-VERIFY = SHA256(base64Response + '/pg/v1/pay' + saltKey) + "###" + saltIndex
  async verifyCallback(xVerifyHeader: string, base64Response: string): Promise<boolean> {
    const expected = await this.generateChecksum(base64Response, '/pg/v1/pay');
    return xVerifyHeader === expected;
  }

  // ── Check payment status
  async checkStatus(merchantTransactionId: string): Promise<unknown> {
    const endpoint  = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
    const checksum  = await this.generateChecksum('', endpoint);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY':     checksum,
        'X-MERCHANT-ID': this.merchantId,
      },
    });

    return response.json();
  }

  // ── Initiate refund
  async initiateRefund(params: {
    originalTransactionId: string;
    amount:                number;   // INR rupees
  }): Promise<unknown> {
    const refundId = `REF${Date.now()}`;
    const payload  = {
      merchantId:            this.merchantId,
      merchantUserId:        'SYSTEM',
      merchantTransactionId: refundId,
      originalTransactionId: params.originalTransactionId,
      amount:                Math.round(params.amount * 100),
    };

    const base64Payload = btoa(JSON.stringify(payload));
    const checksum      = await this.generateChecksum(base64Payload, '/pg/v1/refund');

    const response = await fetch(`${this.baseUrl}/pg/v1/refund`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY':     checksum,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    return response.json();
  }
}
