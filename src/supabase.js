//supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ldkbzfcoewzynxawicxg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxka2J6ZmNvZXd6eW54YXdpY3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU4NjQwMDQsImV4cCI6MjAzMTQ0MDAwNH0.sE_JK5ZbobAOzWKR6osasEVfZPWhVt08NhRf0XgrsmA'

export const supabase = createClient(supabaseUrl, supabaseKey)