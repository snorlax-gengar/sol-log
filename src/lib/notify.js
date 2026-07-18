// 알림 표시 유틸.
// 우선순위: 서비스워커 showNotification (설치형 PWA/iOS 지원) -> 페이지 Notification -> 실패
// 어느 쪽도 안 되면 호출부가 인앱 토스트로 폴백한다.

let swRegistration = null

/** main에서 1회 호출: 서비스워커 등록 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js')
    return swRegistration
  } catch {
    return null
  }
}

async function getRegistration() {
  if (swRegistration) return swRegistration
  if (!('serviceWorker' in navigator)) return null
  try {
    swRegistration = await navigator.serviceWorker.ready
    return swRegistration
  } catch {
    return null
  }
}

/**
 * 시스템 알림 표시. 성공하면 true.
 * @returns {Promise<boolean>}
 */
export async function showSystemNotification({ title, body, tag }) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return false
  }

  // 1) 서비스워커 경로 (모바일/설치형 PWA에서 신뢰도 높음)
  const registration = await getRegistration()
  if (registration?.showNotification) {
    try {
      await registration.showNotification(title, {
        body,
        tag,
        renotify: Boolean(tag),
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { url: '/' },
      })
      return true
    } catch {
      // 아래 폴백 시도
    }
  }

  // 2) 페이지 Notification (데스크톱)
  try {
    // eslint-disable-next-line no-new
    new Notification(title, { body, tag, icon: '/icon-192.png' })
    return true
  } catch {
    return false
  }
}
