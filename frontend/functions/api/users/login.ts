export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();

    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
       return new Response(JSON.stringify({ error: 'Erro de configuração: Chaves do Supabase não encontradas no Cloudflare' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_user_password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        p_email: email, 
        p_password: password 
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(JSON.stringify({ error: `Erro no Supabase: ${res.status}`, detail: errorText }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const users = await res.json();
    
    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = users[0];
    const company = user.company_data;
    const isExpired = company.trialEndsAt && new Date(company.trialEndsAt) < new Date();

    return new Response(JSON.stringify({
      user: { ...user, company: company },
      expired: isExpired
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro crítico no Edge', detail: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
