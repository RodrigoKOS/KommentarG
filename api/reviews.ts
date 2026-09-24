import type { VercelRequest, VercelResponse } from '@vercel/node';

// MODO DE TESTE: se não tiver chave do Google, devolve falsos.
const MOCK_REVIEWS = [
  {
    id: '1',
    author: 'Maria S.',
    stars: 5,
    text: 'Atendimento maravilhoso, voltarei com certeza!',
    date: '2026-09-10',
    source: 'mock'
  },
  {
    id: '2',
    author: 'João P.',
    stars: 5,
    text: 'Lugar incrível, super recomendo.',
    date: '2026-09-12',
    source: 'mock'
  },
  {
    id: '3',
    author: 'Ana L.',
    stars: 4,
    text: 'Muito bom, só a espera foi um pouco longa.',
    date: '2026-09-15',
    source: 'mock'
  }
];

function mockResponse(res: VercelResponse) {
  return res.status(200).json({
    business: 'Minha Empresa Exemplo',
    rating: 4.9,
    total: MOCK_REVIEWS.length,
    mode: 'mock - coloque GOOGLE_MAPS_API_KEY e GOOGLE_PLACE_ID na Vercel para dados reais',
    reviews: MOCK_REVIEWS
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // Sem chave -> modo falso para não quebrar o visual
  if (!apiKey || !placeId) {
    return mockResponse(res);
  }

  // Se passou ?mock=true força o falso para testar visual
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
      stars: rv.rating || 0,
      text: rv.text?.text || '',
      date: rv.publishTime?.slice(0, 10) || '',
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
