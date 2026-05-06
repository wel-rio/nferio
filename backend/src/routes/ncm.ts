import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Cache em memória para não sobrecarregar a API
let ncmCache: any[] = [];
let lastFetch = 0;

async function getNcmList() {
  const now = Date.now();
  // Atualiza cache a cada 24h
  if (ncmCache.length === 0 || (now - lastFetch) > 86400000) {
    try {
      const res = await axios.get('https://brasilapi.com.br/api/ncm/v1');
      ncmCache = res.data;
      lastFetch = now;
    } catch (error) {
      console.error('Erro ao buscar NCMs da BrasilAPI:', error);
      return [];
    }
  }
  return ncmCache;
}

/**
 * Busca NCM por descrição ou código
 */
router.get('/search', async (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  try {
    const list = await getNcmList();
    const q = String(query).toLowerCase();
    
    // Dicionário de Sinônimos para ajudar na busca comercial
    const synonyms: Record<string, string[]> = {
      'roupeiro': ['quarto', 'dormir', 'móveis', 'madeira'],
      'guarda-roupa': ['quarto', 'dormir', 'móveis', 'madeira'],
      'armário': ['móveis', 'madeira', 'cozinha', 'escritório'],
      'balcão': ['móveis', 'cozinha'],
      'mesa': ['móveis', 'madeira', 'escritório'],
      'cadeira': ['assento', 'móveis']
    };

    let words = q.split(' ').filter(w => w.length > 2);
    
    // Se o termo pesquisado tem sinônimos conhecidos, adiciona à busca
    if (synonyms[q]) {
      words = [...words, ...synonyms[q]];
    }
    
    const results = list.filter(item => {
      const desc = item.descricao.toLowerCase();
      const code = item.codigo;

      if (code.includes(q)) return true;

      // Busca flexível: Se QUALQUER uma das palavras bater (para aumentar o alcance)
      // ou se o termo exato estiver lá
      return words.some(word => desc.includes(word)) || desc.includes(q);
    }).slice(0, 30);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Erro na busca de NCM' });
  }
});

/**
 * Busca dados do produto pelo código de barras (EAN)
 * Tenta usar a Cosmos/BlueSoft via busca pública
 */
router.get('/barcode/:ean', async (req: Request, res: Response) => {
  const { ean } = req.params;
  try {
    // Nota: A Cosmos exige token para API oficial, mas podemos usar a BrasilAPI para NCM se disponível no futuro
    // Por enquanto, vamos retornar um mock ou integrar com uma API gratuita se encontrada
    // Exemplo de integração futura:
    // const resCosmos = await axios.get(`https://api.cosmos.bluesoft.com.br/gtins/${ean}`, { headers: { 'X-Cosmos-Token': '...' } });
    
    res.json({ message: 'Funcionalidade de busca por EAN requer Token Cosmos. NCM pode ser buscado manualmente pelo nome.' });
  } catch (error) {
    res.status(404).json({ error: 'Produto não encontrado' });
  }
});

export default router;
