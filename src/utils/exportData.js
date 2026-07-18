import { supabase } from '@/lib/supabaseClient'

function downloadBlob(filename, text, type) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function todayStamp() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
}

/**
 * 접근 가능한 모든 데이터를 JSON으로 백업 다운로드.
 * RLS가 적용되므로 로그인 계정이 볼 수 있는 범위만 내려온다
 * (부모: 기록/진료 + 본인 일기, 자녀: 일기).
 */
export async function exportAllData() {
  const [care, medical, diaries] = await Promise.all([
    supabase.from('care_logs').select('*').order('logged_at', { ascending: true }),
    supabase.from('medical_logs').select('*').order('visit_date', { ascending: true }),
    supabase.from('diaries').select('*').order('diary_date', { ascending: true }),
  ])

  const firstError = care.error || medical.error || diaries.error
  if (firstError) {
    return { error: firstError.message || '데이터를 불러오지 못했습니다.' }
  }

  const payload = {
    app: 'sol-log',
    exportedAt: new Date().toISOString(),
    care_logs: care.data || [],
    medical_logs: medical.data || [],
    diaries: diaries.data || [],
  }

  downloadBlob(
    `sol-log-backup-${todayStamp()}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  )

  return {
    error: null,
    counts: {
      care: payload.care_logs.length,
      medical: payload.medical_logs.length,
      diaries: payload.diaries.length,
    },
  }
}
