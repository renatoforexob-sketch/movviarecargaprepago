import { randomUUID } from 'node:crypto';

const ALLOWED_AMOUNTS = new Set([20, 25, 30, 35, 40, 50, 60, 70, 100]);
const OPERATORS = { algar: 'Algar', claro: 'Claro', correios: 'Correios Celular', surf: 'Surf Telecom', tim: 'TIM', vivo: 'Vivo' };
const DEFAULT_API_URL = 'https://api.blackcatoficial.com/api/sales/create-sale';
const ALLOWED_HOSTS = new Set(['api.blackcatoficial.com']);

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  return res.status(status).json(body);
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === String(req.headers.host || '').toLowerCase(); }
  catch { return false; }
}

function validCPF(value) {
  const cpf = String(value || '').replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  return digit === Number(cpf[10]);
}

function validEndpoint(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ALLOWED_HOSTS.has(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { success: false, message: 'Método não permitido.' });
  }
  if (!sameOrigin(req)) return json(res, 403, { success: false, message: 'Solicitação não autorizada.' });
  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) {
    return json(res, 415, { success: false, message: 'Formato de solicitação inválido.' });
  }
  if (Number(req.headers['content-length'] || 0) > 4096) return json(res, 413, { success: false, message: 'Solicitação muito grande.' });
  if (!process.env.BLACKCAT_API_KEY) return json(res, 503, { success: false, message: 'O pagamento está temporariamente indisponível.' });

  const input = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const amount = Number(input.amount);
  const operator = OPERATORS[String(input.operator || '')];
  const phone = String(input.phone || '').replace(/\D/g, '');
  const customer = input.customer && typeof input.customer === 'object' && !Array.isArray(input.customer) ? input.customer : {};
  const customerName = String(customer.name || '').trim().slice(0, 100);
  const customerEmail = String(customer.email || '').trim().slice(0, 120);
  const customerDocument = String(customer.cpf || customer.document || '').replace(/\D/g, '');

  if (!Number.isInteger(amount) || !ALLOWED_AMOUNTS.has(amount)) {
    return json(res, 400, { success: false, message: 'Valor de recarga inválido.' });
  }
  if (!operator) return json(res, 400, { success: false, message: 'Operadora inválida.' });
  if (!/^\d{11}$/.test(phone) || phone[2] !== '9' || /^([0-9])\1+$/.test(phone)) {
    return json(res, 400, { success: false, message: 'Informe um celular válido com DDD.' });
  }
  if (customerName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || !validCPF(customerDocument)) {
    return json(res, 400, { success: false, message: 'Informe nome, e-mail e CPF válidos.' });
  }

  const apiUrl = process.env.BLACKCAT_API_URL || DEFAULT_API_URL;
  if (!validEndpoint(apiUrl)) return json(res, 503, { success: false, message: 'O pagamento está temporariamente indisponível.' });

  const payload = {
    amount: amount * 100,
    currency: 'BRL',
    paymentMethod: 'pix',
    items: [{ title: `Recarga de celular - ${operator}`, unitPrice: amount * 100, quantity: 1, tangible: false }],
    customer: {
      name: customerName,
      email: customerEmail,
      phone,
      document: { number: customerDocument, type: 'cpf' },
    },
    metadata: `operator=${String(input.operator)};recipientPhone=${phone};brand=Movvia`,
    ...(String(input.postbackUrl || '').trim() ? { postbackUrl: String(input.postbackUrl).trim().slice(0, 500) } : {}),
    ...(String(input.utm_source || '').trim() ? { utm_source: String(input.utm_source).trim().slice(0, 120) } : {}),
    ...(String(input.utm_medium || '').trim() ? { utm_medium: String(input.utm_medium).trim().slice(0, 120) } : {}),
    ...(String(input.utm_campaign || '').trim() ? { utm_campaign: String(input.utm_campaign).trim().slice(0, 160) } : {}),
    ...(String(input.utm_content || '').trim() ? { utm_content: String(input.utm_content).trim().slice(0, 160) } : {}),
    ...(String(input.utm_term || '').trim() ? { utm_term: String(input.utm_term).trim().slice(0, 160) } : {}),
    pix: { expiresInDays: 1 },
    externalRef: `MOVVIA-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 12)}`,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.BLACKCAT_API_KEY },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });
    const data = await response.json().catch(() => null);
    const paymentData = data?.data?.paymentData;
    const copyPaste = typeof paymentData?.copyPaste === 'string' ? paymentData.copyPaste : '';
    if (!response.ok || !copyPaste || copyPaste.length > 10000) {
      return json(res, 502, { success: false, message: 'Não foi possível iniciar o pagamento. Tente novamente mais tarde.' });
    }
    return json(res, 200, {
      success: true,
      data: {
        paymentData: { copyPaste, qrCodeBase64: typeof paymentData.qrCodeBase64 === 'string' ? paymentData.qrCodeBase64 : null },
        transactionId: typeof data?.data?.transactionId === 'string' ? data.data.transactionId.slice(0, 120) : null,
        status: typeof data?.data?.status === 'string' ? data.data.status.slice(0, 40) : 'PENDING',
        amount: amount * 100,
      },
    });
  } catch {
    return json(res, 502, { success: false, message: 'Não foi possível conectar ao serviço de pagamento.' });
  }
}
