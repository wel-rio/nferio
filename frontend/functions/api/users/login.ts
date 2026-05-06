export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();

    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

    // Chamando a função RPC que criamos no banco
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

    const users = await res.json();
    const user = users[0];

    if (!user) {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Adaptar formato para o frontend
    const company = user.company_data;
    const isExpired = company.trialEndsAt && new Date(company.trialEndsAt) < new Date();

    return new Response(JSON.stringify({
      user: {
        ...user,
        company: company
      },
      expired: isExpired
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro no servidor central' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
