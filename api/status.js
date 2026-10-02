const STATUS_BASE_URL = 'https://api.blackcatpay.com.br/api/sales';

function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { success: false, message: 'Método não permitido.' });
  }
  if (!process.env.BLACKCAT_API_KEY) {
    return json(res, 503, { success: false, message: 'Consulta de pagamento temporariamente indisponível.' });
  }
  const transaction = String(req.query?.transaction || '');
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(transaction)) {
    return json(res, 400, { success: false, message: 'Identificador de transação inválido.' });
  }
  try {
    const response = await fetch(`${STATUS_BASE_URL}/${encodeURIComponent(transaction)}/status`, {
      headers: { 'X-API-Key': process.env.BLACKCAT_API_KEY, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return json(res, 502, { success: false, message: 'Não foi possível consultar o pagamento.' });
    const status = String(data?.data?.status ?? data?.status ?? 'UNKNOWN').slice(0, 40);
    return json(res, 200, { success: true, status });
  } catch {
    return json(res, 502, { success: false, message: 'Não foi possível consultar o pagamento.' });
  }
}
