import type { VercelRequest, VercelResponse } from '@vercel/node';

// MODO DE TESTE: enquanto não ligamos o Google de verdade,
// devolvemos comentários falsos para você ver como vai ficar no site.
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

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Libera para qualquer site testar (depois vamos travar por cliente)
  res.setHeader('Access-Control-Allow-Origin', '*');

  const useMock = req.query.mock !== 'false';

  if (useMock) {
    return res.status(200).json({
      business: 'Minha Empresa Exemplo',
      rating: 4.9,
      total: MOCK_REVIEWS.length,
      mode: 'mock - conecte o Google para dados reais',
      reviews: MOCK_REVIEWS
    });
  }

  // PASSO 1 (futuro): aqui vamos chamar o Google de verdade.
  // Precisa de GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_ACCOUNT_ID, GOOGLE_LOCATION_ID
  return res.status(501).json({
    error: 'Modo Google real ainda não configurado. Veja .env.example e README.'
  });
}
