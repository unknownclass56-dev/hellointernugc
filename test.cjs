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
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing env vars!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Latest profiles:");
    console.log(JSON.stringify(profiles, null, 2));
  }
}

run();
