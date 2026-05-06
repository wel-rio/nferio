export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  
  // Se for login, o Cloudflare já tem a função específica, então ele pula esta.
  if (path.includes('users/login')) return next();

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // Mapeamento simples de Rota -> Tabela
    // Ex: /api/products -> Tabela "Product"
    const tableMap = {
      'products': 'Product',
      'customers': 'Customer',
      'finance': 'Finance',
      'employees': 'Employee'
    };

    const tableName = Object.keys(tableMap).find(k => path.startsWith(k));
    
    if (!tableName) {
      return new Response(JSON.stringify({ error: 'Rota não mapeada no Edge' }), { status: 404 });
    }

    const supabaseTable = tableMap[tableName];
    const searchParams = url.search; // Pega tudo depois da "?"
    
    // Proxy para o Supabase REST API (agora com parâmetros de busca)
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
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro no Edge Proxy' }), { status: 500 });
  }
}
