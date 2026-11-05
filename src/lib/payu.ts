/**
 * PayU Automated Payment Service Integration
 * Supports PayU Hosted Checkout & Bolt Web Checkout for INR transactions
 */

export interface PayUConfig {
  merchantKey: string;
  merchantSalt: string;
  mode: 'sandbox' | 'production';
  isConfigured: boolean;
}

const LOCAL_STORAGE_KEY = 'payu_merchant_config_v1';

export function getPayUConfig(): PayUConfig {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.merchantKey && parsed.merchantSalt) {
        return {
          merchantKey: parsed.merchantKey.trim(),
          merchantSalt: parsed.merchantSalt.trim(),
          mode: parsed.mode || 'sandbox',
          isConfigured: true,
        };
      }
    }
  } catch {
    // fallback
  }

  // Check Vite env
  const envKey = (import.meta as any).env?.VITE_PAYU_MERCHANT_KEY || '';
  const envSalt = (import.meta as any).env?.VITE_PAYU_MERCHANT_SALT || '';
  const envMode = (import.meta as any).env?.VITE_PAYU_MODE || 'sandbox';

  if (envKey && envSalt) {
    return {
      merchantKey: envKey.trim(),
      merchantSalt: envSalt.trim(),
      mode: envMode === 'production' ? 'production' : 'sandbox',
      isConfigured: true,
    };
  }

  // Default sandbox placeholder
  return {
    merchantKey: 'gtKFFx', // Standard PayU public test merchant key
    merchantSalt: 'eCwWELxi', // Standard PayU test salt
    mode: 'sandbox',
    isConfigured: false,
  };
}

export function savePayUConfig(config: { merchantKey: string; merchantSalt: string; mode: 'sandbox' | 'production' }): void {
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({
      merchantKey: config.merchantKey.trim(),
      merchantSalt: config.merchantSalt.trim(),
      mode: config.mode,
    })
  );
}

/**
 * Calculates PayU SHA-512 request hash:
 * hash = sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export async function calculatePayUHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): Promise<string> {
  const udf1 = params.udf1 || '';
  const udf2 = params.udf2 || '';
  const udf3 = params.udf3 || '';
  const udf4 = params.udf4 || '';
  const udf5 = params.udf5 || '';

  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${params.salt}`;

  const msgUint8 = new TextEncoder().encode(hashString);
  const hashBuffer = await crypto.subtle.digest('SHA-512', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface PayUPaymentPayload {
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl?: string;
  furl?: string;
}

/**
 * Launches PayU Hosted Payment Checkout Form
 */
export async function launchPayUCheckout(payload: PayUPaymentPayload, config?: PayUConfig): Promise<void> {
  const currentConfig = config || getPayUConfig();
  const endpoint =
    currentConfig.mode === 'production'
      ? 'https://secure.payu.in/_payment'
      : 'https://test.payu.in/_payment';

  const amountStr = payload.amount.toFixed(2);
  const cleanProductInfo = payload.productinfo.substring(0, 80).replace(/[^a-zA-Z0-9 _-]/g, '');
  const cleanFirstname = (payload.firstname.split(' ')[0] || 'Customer').substring(0, 30);
  const surl = payload.surl || `${window.location.origin}/buy-projects?payu_status=success&txnid=${payload.txnid}`;
  const furl = payload.furl || `${window.location.origin}/buy-projects?payu_status=failure&txnid=${payload.txnid}`;

  const hash = await calculatePayUHash({
    key: currentConfig.merchantKey,
    txnid: payload.txnid,
    amount: amountStr,
    productinfo: cleanProductInfo,
    firstname: cleanFirstname,
    email: payload.email,
    salt: currentConfig.merchantSalt,
  });

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = endpoint;
  form.style.display = 'none';

  const fields: Record<string, string> = {
    key: currentConfig.merchantKey,
    txnid: payload.txnid,
    amount: amountStr,
    productinfo: cleanProductInfo,
    firstname: cleanFirstname,
    email: payload.email,
    phone: payload.phone || '9999999999',
    surl: surl,
    furl: furl,
    hash: hash,
    service_provider: 'payu_paisa',
  };

  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
