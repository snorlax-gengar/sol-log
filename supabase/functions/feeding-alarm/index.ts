// Supabase Edge Function: 수유 예상 시각이 지난 아이를 찾아 서버 푸시 발송
// cron(예: 5분마다)이 호출한다. 앱이 완전히 꺼져 있어도 알림이 간다.
//
// 필요한 secrets (supabase secrets set ...):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT(mailto:you@example.com), CRON_SECRET
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 는 기본 제공됨.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const DEFAULT_INTERVAL_MIN = 180
const MIN_INTERVAL_MIN = 60
const MAX_INTERVAL_MIN = 300
const REPEAT_MIN = 15 // 재알림 간격
const STOP_AFTER_OVERDUE_MIN = 90 // 이보다 더 지나면 그만 알림 (과도한 알림 방지)
const FEEDING_TYPES = new Set(['breast', 'formula', 'pumped', 'food'])

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@sol-log.family',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

function isFeeding(log: Record<string, unknown>) {
  return FEEDING_TYPES.has(String(log.feeding_type))
}

// 최근 7일 내 마지막 7건의 간격 평균(분). 부족하면 기본값.
function recentIntervalMin(feedings: { logged_at: string }[]) {
  const since = Date.now() - 7 * 86400000
  const recent = feedings
    .filter((f) => new Date(f.logged_at).getTime() >= since)
    .slice(-7)
  if (recent.length < 2) return DEFAULT_INTERVAL_MIN
  let total = 0
  for (let i = 1; i < recent.length; i += 1) {
    total += new Date(recent[i].logged_at).getTime() - new Date(recent[i - 1].logged_at).getTime()
  }
  const avg = total / (recent.length - 1) / 60000
  return Math.min(MAX_INTERVAL_MIN, Math.max(MIN_INTERVAL_MIN, Math.round(avg)))
}

async function processChild(child: { id: string }) {
  // 이 아이의 수유 기록 (오래된 -> 최신)
  const { data: logs } = await supabase
    .from('care_logs')
    .select('id, logged_at, feeding_type')
    .eq('child_id', child.id)
    .order('logged_at', { ascending: true })

  const feedings = (logs || []).filter(isFeeding)
  if (feedings.length === 0) return 0

  const last = feedings[feedings.length - 1]
  const interval = recentIntervalMin(feedings)
  const dueAt = new Date(last.logged_at).getTime() + interval * 60000
  const now = Date.now()

  const overdueMin = Math.floor((now - dueAt) / 60000)
  if (overdueMin < 0 || overdueMin > STOP_AFTER_OVERDUE_MIN) return 0

  // 이 아이에 연결된 활성 구독
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('child_id', child.id)
    .eq('enabled', true)

  if (!subs || subs.length === 0) return 0

  const body =
    overdueMin < 1
      ? '수유 시간이 되었어요.'
      : `수유 예상 시간이 ${overdueMin}분 지났어요.`
  const payload = JSON.stringify({
    title: '솔로그 수유 알람',
    body,
    tag: `sol-log-feeding-${last.id}`,
    url: '/',
  })

  let sent = 0
  for (const sub of subs) {
    // 중복 방지: 같은 수유 사이클은 15분에 한 번만
    const lastAt = sub.last_notified_at ? new Date(sub.last_notified_at).getTime() : 0
    const sameCycle = sub.last_notified_feeding_id === last.id
    if (sameCycle && now - lastAt < REPEAT_MIN * 60000) continue

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      )
      await supabase
        .from('push_subscriptions')
        .update({
          last_notified_at: new Date(now).toISOString(),
          last_notified_feeding_id: last.id,
        })
        .eq('id', sub.id)
      sent += 1
    } catch (err) {
      const status = (err as { statusCode?: number })?.statusCode
      // 만료/삭제된 구독은 정리
      if (status === 404 || status === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
      }
    }
  }
  return sent
}

Deno.serve(async (req) => {
  // cron 전용 보호: CRON_SECRET 설정 시 헤더 일치 요구
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret) {
    const provided = req.headers.get('x-cron-secret')
    if (provided !== cronSecret) {
      return new Response('unauthorized', { status: 401 })
    }
  }

  const { data: children } = await supabase
    .from('children')
    .select('id')
    .eq('feeding_alarm_enabled', true)

  let totalSent = 0
  for (const child of children || []) {
    totalSent += await processChild(child)
  }

  return new Response(JSON.stringify({ ok: true, sent: totalSent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
