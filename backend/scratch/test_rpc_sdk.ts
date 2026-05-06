import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('🚀 Testando chamada RPC via SDK...');
  
  const { data, error } = await supabase.rpc('check_user_password', {
    p_email: 'contato.rtcdecor@gmail.com',
    p_password: '@Master2026'
  });

  if (error) {
    console.error('❌ ERRO NO TESTE:', error);
  } else {
    console.log('✅ SUCESSO NO TESTE! Resultado:', JSON.stringify(data, null, 2));
  }
}

test();
