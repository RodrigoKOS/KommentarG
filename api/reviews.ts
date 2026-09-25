import type { VercelRequest, VercelResponse } from '@vercel/node';

// MODO DE TESTE: se não tiver chave do Google, devolve falsos no mesmo formato do layout.
const MOCK_REVIEWS = [
  {
    id: '1',
    author: 'Sonaria Linhares',
    authorPhoto: '',
    authorUri: '',
    stars: 5,
    text: 'Minha Fisioterapeuta Lindaaa. Fiz 30 sessões de Fisioterapia, depois iniciei o Pilates e estou a 4 anos. Devido uma melhora incrível na minha qualidade de vida, recomendo de olhos fechados!',
    date: '2026-09-06',
    relativeTime: '19 days ago',
    source: 'mock'
  },
  {
    id: '2',
    author: 'Josefran Zumba',
    authorPhoto: '',
    authorUri: '',
    stars: 5,
    text: 'Sem dúvidas a melhor da região. Pessoal comprometido com o trabalho e atenciosos. Sugerem, fazem protótipos e alcançam os desejos do cliente. Parabéns!',
    date: '2024-02-16',
    relativeTime: '2 anos atrás',
    source: 'mock'
  }
];

function mockResponse(res: VercelResponse) {
  return res.status(200).json({
    business: 'Empresa Exemplo',
    rating: 5,
    total: MOCK_REVIEWS.length,
    mode: 'mock - coloque GOOGLE_MAPS_API_KEY na Vercel para dados reais. Use ?place=SEU_PLACE_ID',
    reviews: MOCK_REVIEWS
  });
}

function getPlaceId(req: VercelRequest): string {
  const q = req.query.place || req.query.id || req.query.placeId;
  const fromQuery = Array.isArray(q) ? q[0] : q;
  if (typeof fromQuery === 'string' && fromQuery.startsWith('ChIJ')) {
    return fromQuery;
  }
  return process.env.GOOGLE_PLACE_ID || '';
}

function isAllowed(placeId: string): boolean {
  const list = process.env.GOOGLE_ALLOWED_PLACES;
  if (!list) return true; // sem lista = aceita qualquer um (modo simples para começar)
  const allowed = list.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.length === 0) return true;
  return allowed.includes(placeId);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = getPlaceId(req);

  if (!apiKey || !placeId) {
    return mockResponse(res);
  }

  if (!isAllowed(placeId)) {
    return res.status(403).json({ error: 'Esse cliente não está liberado. Adicione o Place ID em GOOGLE_ALLOWED_PLACES na Vercel.' });
  }

  if (req.query.mock === 'true') {
    return mockResponse(res);
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=id,displayName,rating,userRatingCount,reviews&languageCode=pt-BR`;
    const r = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews'
      }
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: 'Google respondeu erro', detail: txt.slice(0, 500), mode: 'google-error' });
    }

    const data: any = await r.json();
    const reviews = (data.reviews || []).map((rv: any, i: number) => ({
      id: String(i + 1),
      author: rv.authorAttribution?.displayName || 'Anônimo',
      authorPhoto: rv.authorAttribution?.photoUri || '',
      authorUri: rv.authorAttribution?.uri || rv.googleMapsUri || '',
      stars: rv.rating || 0,
      text: rv.text?.text || rv.originalText?.text || '',
      date: rv.publishTime?.slice(0, 10) || '',
      relativeTime: rv.relativePublishTimeDescription || '',
      source: 'google-places'
    }));

    return res.status(200).json({
      business: data.displayName?.text || 'Empresa',
      rating: data.rating || 0,
      total: data.userRatingCount || reviews.length,
      mode: 'google-places-new',
      placeId: data.id,
      reviews
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'Falha ao buscar no Google', detail: String(e?.message || e) });
  }
}
