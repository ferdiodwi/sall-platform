import { NextRequest, NextResponse } from 'next/server'
import { getAiConfig, saveAiConfig } from '@/lib/ai-config-helper'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Auth verification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single() as any

    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden. Guru Only.' }, { status: 403 })
    }

    const config = await getAiConfig()
    return NextResponse.json(config)
  } catch (err: any) {
    console.error('Error fetching AI config:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Auth verification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single() as any

    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden. Guru Only.' }, { status: 403 })
    }

    const { prompt_template, max_tokens } = await request.json()
    if (prompt_template === undefined || max_tokens === undefined) {
      return NextResponse.json({ error: 'Missing prompt_template or max_tokens' }, { status: 400 })
    }

    const success = await saveAiConfig(prompt_template, Number(max_tokens))
    if (!success) {
      throw new Error('Save configuration failed')
    }

    return NextResponse.json({ success: true, message: 'Konfigurasi AI berhasil disimpan!' })
  } catch (err: any) {
    console.error('Error saving AI config:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
