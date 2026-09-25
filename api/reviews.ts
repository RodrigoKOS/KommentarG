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
    business: 'Desata Estúdio Design',
    rating: 5,
    total: 10,
    mode: 'mock - coloque GOOGLE_MAPS_API_KEY e GOOGLE_PLACE_ID na Vercel para dados reais',
    reviews: MOCK_REVIEWS
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return mockResponse(res);
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
