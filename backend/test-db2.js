const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const { data } = await supabase.from('users').select('*').eq('email', 'justus1274@gmail.com');
  console.log("Justus User in public.users:", data);
}
check();
