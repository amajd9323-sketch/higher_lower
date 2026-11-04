import { createClient } from '@supabase/supabase-js'

const STORAGE_KEY = 'hld-supabase-config'

export function getSupabaseConfig() {
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { saved = {} }
  return {
    url: saved.url || import.meta.env.VITE_SUPABASE_URL || '',
    key: saved.key || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  }
}

export function saveSupabaseConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function createRealtimeClient(config = getSupabaseConfig()) {
  if (!config.url || !config.key) return null
  try {
    return createClient(config.url.trim(), config.key.trim(), {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      realtime: { params: { eventsPerSecond: 24 } },
    })
  } catch {
    return null
  }
}
