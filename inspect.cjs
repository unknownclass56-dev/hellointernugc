const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRpcs() {
  const commonRpcs = ['exec_sql', 'run_sql', 'execute_sql', 'sql', 'query'];
  for (const rpc of commonRpcs) {
    const { data, error } = await supabase.rpc(rpc, { sql: 'SELECT 1;' });
    console.log(`RPC ${rpc}:`, error ? error.message : 'SUCCESS!', data);
  }
}

testRpcs();
