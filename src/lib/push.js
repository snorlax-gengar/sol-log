import { supabase } from '@/lib/supabaseClient'
import { getDefaultChildId } from '@/lib/childId'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    typeof Notification !== 'undefined'
  )
}

// VAPID 공개키(base64url) -> Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

function toKeys(subscription) {
  const json = subscription.toJSON()
  return {
    endpoint: json.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
  }
}

/**
 * 이 기기를 서버 푸시에 구독시키고 Supabase에 저장.
 * 가족 알람을 켜짐(children.feeding_alarm_enabled=true)으로 설정.
 */
export async function subscribeToPush() {
  if (!isPushSupported()) {
    return { error: '이 브라우저는 서버 푸시를 지원하지 않아요.' }
  }
  if (!VAPID_PUBLIC_KEY) {
    return { error: '푸시 설정(VAPID 키)이 아직 배포되지 않았어요.' }
  }

  try {
    const registration = await navigator.serviceWorker.ready

    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    const { endpoint, p256dh, auth } = toKeys(subscription)
    const childId = getDefaultChildId()

    const { error: upsertError } = await supabase
      .from('push_subscriptions')
      .upsert(
        { endpoint, p256dh, auth, child_id: childId, enabled: true },
        { onConflict: 'endpoint' },
      )
    if (upsertError) throw upsertError

    if (childId) {
      await supabase
        .from('children')
        .update({ feeding_alarm_enabled: true })
        .eq('id', childId)
    }

    return { error: null }
  } catch (err) {
    return { error: err?.message || '푸시 구독에 실패했어요.' }
  }
}

/** 이 기기의 구독을 해지하고 저장 레코드 삭제. 가족 알람 끔. */
export async function unsubscribeFromPush() {
  try {
    if (!isPushSupported()) return { error: null }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      const { endpoint } = toKeys(subscription)
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
      await subscription.unsubscribe()
    }

    const childId = getDefaultChildId()
    if (childId) {
      await supabase
        .from('children')
        .update({ feeding_alarm_enabled: false })
        .eq('id', childId)
    }

    return { error: null }
  } catch (err) {
    return { error: err?.message || '푸시 해지에 실패했어요.' }
  }
}
