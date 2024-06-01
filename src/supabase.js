import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://koakfvpwwskmazwvljio.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtmdnB3d3NrbWF6d3ZsamlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU4NDM2NDYsImV4cCI6MjAzMTQxOTY0Nn0.Ix64dISA1pwAKdIw39gr5u7vZOAxIMmk1Jh78vADzac'

export const supabase = createClient(supabaseUrl, supabaseKey)