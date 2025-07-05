import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ztercqerwdtmcjvexlnt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0ZXJjcWVyd2R0bWNqdmV4bG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDU0NzMsImV4cCI6MjA2NzIyMTQ3M30.NK4_ntynU2cZU0BsRe0lMU3KwtwhPFWqUid4DdwdwQk'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connected successfully');
  }
});

export default supabase;