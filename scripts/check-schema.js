const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  let r = await supabase.from('culture_events').select('*').limit(1);
  console.log('CE:', r.error ? r.error.message : JSON.stringify(r.data));
  r = await supabase.from('mega_events').select('*').limit(1);
  console.log('ME:', r.error ? r.error.message : JSON.stringify(r.data));
  r = await supabase.from('conferences').select('*').limit(1);
  console.log('CO:', r.error ? r.error.message : JSON.stringify(r.data));
}
check();
