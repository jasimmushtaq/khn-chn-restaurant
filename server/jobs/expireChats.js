const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
} else {
  console.warn('⚠️ Supabase environment variables missing. Chat cleanup job will not run.');
}

/**
 * Job to expire old chat rooms and cleanup old messages.
 * Runs every 5 minutes.
 */
cron.schedule('*/5 * * * *', async () => {
  if (!supabase) return;
  console.log('Running chat expiry and cleanup job...');

  // 1. Mark rooms as expired
  const { error: expireError } = await supabase
    .from('chat_rooms')
    .update({ status: 'expired' })
    .match({ status: 'active' })
    .lt('expires_at', new Date().toISOString());

  if (expireError) {
    console.error('Error expiring chat rooms:', expireError);
  }

  // 2. Hard-delete messages older than 7 days (GDPR)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { error: deleteError } = await supabase
    .from('chat_messages')
    .delete()
    .lt('sent_at', sevenDaysAgo.toISOString());

  if (deleteError) {
    console.error('Error deleting old messages:', deleteError);
  }
});

console.log('Chat expiry cron job scheduled.');
