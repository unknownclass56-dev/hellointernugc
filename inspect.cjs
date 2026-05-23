const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://prnrdlmmplmxrptdhmfj.supabase.co";
const supabaseAnonKey = "sb_publishable_wqG_8g8c8qIwUPDJDNVx8A_Wi2cA1Hh";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRpcs() {
  const commonRpcs = ['exec_sql', 'run_sql', 'execute_sql', 'sql', 'query'];
  for (const rpc of commonRpcs) {
    const { data, error } = await supabase.rpc(rpc, { sql: 'SELECT 1;' });
    console.log(`RPC ${rpc}:`, error ? error.message : 'SUCCESS!', data);
  }
}

testRpcs();
