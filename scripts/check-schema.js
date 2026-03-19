const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://eiygbtpsfumwvhzbudij.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeWdidHBzZnVtd3ZoemJ1ZGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTgxMjUsImV4cCI6MjA4Nzk5NDEyNX0.qrIkEt-ZOIIs8-isz5qYaFZWEeVfYXqH6nir1u0vtrE'
);

async function check() {
  let r = await supabase.from('culture_events').select('*').limit(1);
  console.log('CE:', r.error ? r.error.message : JSON.stringify(r.data));
  r = await supabase.from('mega_events').select('*').limit(1);
  console.log('ME:', r.error ? r.error.message : JSON.stringify(r.data));
  r = await supabase.from('conferences').select('*').limit(1);
  console.log('CO:', r.error ? r.error.message : JSON.stringify(r.data));
}
check();
