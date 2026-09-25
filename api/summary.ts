import type { VercelRequest, VercelResponse } from '@vercel/node';

// POST /api/summary  { business?, rating?, reviews: [{author, stars, text}] , lang? }
// GET  /api/summary  -> busca reviews do Google (mesma lógica de /api/reviews) e resume
// Precisa de DEEPSEEK_API_KEY na Vercel (e no .env local).
// Modelo padrão: deepseek-v4-flash (barato). Pode trocar com DEEPSEEK_MODEL=deepseek-v4-pro

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

const MOCK_REVIEWS = [
  { author: 'Sonaria Linhares', stars: 5, text: 'Minha Fisioterapeuta Lindaaa. Fiz 30 sessões de Fisioterapia, depois iniciei o Pilates e estou a 4 anos. Devido uma melhora incrível na minha qualidade de vida, recomendo de olhos fechados!' },
  { author: 'Josefran Zumba', stars: 5, text: 'Sem dúvidas a melhor da região. Pessoal comprometido com o trabalho e atenciosos.' },
];

async function getGoogleReviews(req?: VercelRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const q: any = req?.query?.place || req?.query?.id || req?.query?.placeId;
  const fromQuery = Array.isArray(q) ? q[0] : q;
  const placeId = (typeof fromQuery === 'string' && fromQuery.startsWith('ChIJ')) ? fromQuery : process.env.GOOGLE_PLACE_ID;
  const allowed = process.env.GOOGLE_ALLOWED_PLACES;
  if (placeId && allowed) {
    const list = allowed.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length && !list.includes(placeId)) {
      throw new Error('Esse cliente não está liberado em GOOGLE_ALLOWED_PLACES.');
    }
  }
  if (!apiKey || !placeId) {
    return { business: 'Desata Estúdio Design', rating: 5, total: 10, reviews: MOCK_REVIEWS, mode: 'mock' };
  }
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=id,displayName,rating,userRatingCount,reviews&languageCode=pt-BR`;
  const r = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews',
    },
  });
  if (!r.ok) throw new Error('Google erro: ' + (await r.text()).slice(0, 300));
  const data: any = await r.json();
  const reviews = (data.reviews || []).map((rv: any) => ({
    author: rv.authorAttribution?.displayName || 'Anônimo',
    stars: rv.rating || 0,
    text: rv.text?.text || rv.originalText?.text || '',
  }));
  return {
    business: data.displayName?.text || 'Empresa',
    rating: data.rating || 0,
    total: data.userRatingCount || reviews.length,
    reviews,
    mode: 'google-places-new',
  };
}

async function summarizeWithDeepSeek(business: string, rating: number, reviews: any[], lang = 'pt-BR') {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      summary: null,
      mode: 'sem-chave - coloque DEEPSEEK_API_KEY na Vercel para resumo real com IA',
    };
  }

  const list = reviews
    .slice(0, 20)
    .map((r: any, i: number) => `${i + 1}. ${r.author || 'Anônimo'} (${r.stars || 0}★): ${String(r.text || '').slice(0, 400)}`)
    .join('\n');

  const prompt = `Você resume avaliações do Google para o site da empresa "${business}" (nota ${rating}).\nIdioma: ${lang}.\nEscreva em 2-3 frases, tom amigável, em ${lang}, destacando pontos fortes citados. Não invente nada fora dos textos.\n\nAvaliações:\n${list}`;

  const r = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: 'Você é um assistente que resume avaliações de clientes de forma curta e confiável.' },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
      stream: false,
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`DeepSeek ${r.status}: ${txt.slice(0, 500)}`);
  }

  const data: any = await r.json();
  const summary = data.choices?.[0]?.message?.content?.trim() || '';
  return { summary, mode: 'deepseek-' + DEFAULT_MODEL, usage: data.usage };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // POST com reviews prontos
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const reviews = body.reviews || MOCK_REVIEWS;
      const business = body.business || 'Empresa';
      const rating = body.rating || 5;
      const lang = body.lang || 'pt-BR';
      if (!reviews.length) return res.status(400).json({ error: 'Envie reviews: [{author, stars, text}]' });
      const out = await summarizeWithDeepSeek(business, rating, reviews, lang);
      return res.status(200).json({ business, rating, count: reviews.length, ...out });
    }

    // GET: busca do Google e resume
    const data = await getGoogleReviews(req);
    const out = await summarizeWithDeepSeek(data.business, data.rating, data.reviews);
    return res.status(200).json({
      business: data.business,
      rating: data.rating,
      total: data.total,
      count: data.reviews.length,
      reviewsMode: data.mode,
      ...out,
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'Falha no resumo', detail: String(e?.message || e) });
  }
}
