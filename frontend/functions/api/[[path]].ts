export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  
  // Se for login, o Cloudflare já tem a função específica, então ele pula esta.
  if (path.includes('users/login')) return next();

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

  // Handle CORS Pre-flight (Essencial para rodar no localhost)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Mapeamento simples de Rota -> Tabela
    // Ex: /api/products -> Tabela "Product"
    const tableMap = {
      'products': 'Product',
      'customers': 'Customer',
      'finance': 'AccountReceivable', // Ajustado para o esquema real
      'payables': 'AccountPayable',
      'users': 'User',
      'orders': 'Order',
      'categories': 'Category',
      'employees': 'Employee'
    };

    const tableName = Object.keys(tableMap).find(k => path.startsWith(k));
    
    if (!tableName) {
      return new Response(JSON.stringify({ error: 'Rota não mapeada no Edge' }), { status: 404 });
    }

    const supabaseTable = tableMap[tableName];
    
    // Tradução de Query Params (Transforma ?companyId=123 em ?companyId=eq.123)
    // O Supabase REST exige o operador "eq." para filtros de igualdade.
    const newParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      // Se já tiver operador (ponto), deixa como está, senão adiciona "eq."
      if (value.includes('.') || key === 'select' || key === 'order') {
        newParams.append(key, value);
      } else {
        newParams.append(key, `eq.${value}`);
      }
    });

    const searchParams = newParams.toString() ? `?${newParams.toString()}` : '';
    
    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/${supabaseTable}${searchParams}`, {
      method: request.method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: (request.method !== 'GET' && request.method !== 'HEAD') ? await request.text() : undefined
    });

    const data = await supabaseRes.json();
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro no Edge Proxy' }), { status: 500 });
  }
}
