import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const DEFAULT_PROMPT = 'Anda adalah asisten AI guru bahasa Inggris yang ahli. Analisis kesalahan kuis tata busana/fashion siswa berikut dan berikan feedback yang dipersonalisasi serta rekomendasi belajar yang terukur.'
const DEFAULT_MAX_TOKENS = 1000

const LOCAL_FILE_PATH = path.join(process.cwd(), 'lib', 'ai-config-local.json')

interface AiConfig {
  prompt_template: string
  max_tokens: number
}

function getLocalConfig(): AiConfig {
  try {
    if (fs.existsSync(LOCAL_FILE_PATH)) {
      const content = fs.readFileSync(LOCAL_FILE_PATH, 'utf-8')
      return JSON.parse(content)
    }
  } catch (err) {
    console.error('Error reading local AI config file:', err)
  }
  return { prompt_template: DEFAULT_PROMPT, max_tokens: DEFAULT_MAX_TOKENS }
}

function saveLocalConfig(config: AiConfig) {
  try {
    const dir = path.dirname(LOCAL_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(LOCAL_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing local AI config file:', err)
  }
}

export async function getAiConfig(): Promise<AiConfig> {
  // Hubungkan ke Supabase dengan service role key untuk bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data, error } = await supabase
      .from('ai_config')
      .select('prompt_template, max_tokens')
      .eq('id', '11111111-1111-1111-1111-111111111111')
      .single()

    if (error) {
      // Jika table tidak ditemukan atau error query, gunakan local file
      return getLocalConfig()
    }

    return {
      prompt_template: data.prompt_template,
      max_tokens: data.max_tokens,
    }
  } catch (err) {
    return getLocalConfig()
  }
}

export async function saveAiConfig(promptTemplate: string, maxTokens: number): Promise<boolean> {
  const config = { prompt_template: promptTemplate, max_tokens: maxTokens }
  
  // Selalu simpan di local file sebagai backup
  saveLocalConfig(config)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Cek apakah data default sudah ada
    const { data, error: fetchError } = await supabase
      .from('ai_config')
      .select('id')
      .eq('id', '11111111-1111-1111-1111-111111111111')
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // Jika data belum ada, insert
      const { error: insertError } = await supabase
        .from('ai_config')
        .insert({
          id: '11111111-1111-1111-1111-111111111111',
          prompt_template: promptTemplate,
          max_tokens: maxTokens,
        })
      if (insertError) throw insertError
    } else {
      // Jika data sudah ada, update
      const { error: updateError } = await supabase
        .from('ai_config')
        .update({
          prompt_template: promptTemplate,
          max_tokens: maxTokens,
          updated_at: new Date().toISOString(),
        })
        .eq('id', '11111111-1111-1111-1111-111111111111')
      if (updateError) throw updateError
    }
    return true
  } catch (err) {
    console.warn('Database save failed for AI config, saved to local file system instead:', err)
    return true // Tetap return true karena sudah tersimpan di file system fallback
  }
}

export function resetAiConfigToDefault(): AiConfig {
  const config = { prompt_template: DEFAULT_PROMPT, max_tokens: DEFAULT_MAX_TOKENS }
  saveLocalConfig(config)
  return config
}
