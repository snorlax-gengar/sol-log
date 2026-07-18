// 솔로그 서비스워커
// - 설치형 PWA에서 알림을 표시/처리 (iOS 16.4+ 설치 PWA 포함)
// - 페이지에서 postMessage로 알림 요청을 받으면 showNotification 실행
//   (앱이 백그라운드 탭이어도 표시됨 / iOS는 홈 화면 설치 상태에서 동작)

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// 페이지 -> SW: { type: 'SHOW_NOTIFICATION', title, body, tag }
self.addEventListener('message', (event) => {
  const data = event.data || {}
  if (data.type !== 'SHOW_NOTIFICATION') return

  event.waitUntil(
    self.registration.showNotification(data.title || '솔로그', {
      body: data.body || '',
      tag: data.tag,
      renotify: Boolean(data.tag),
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: '/' },
    }),
  )
})

// 서버 Web Push 수신 -> 알림 표시 (앱이 완전히 꺼져 있어도 동작)
self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: '솔로그', body: event.data ? event.data.text() : '' }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || '솔로그 수유 알람', {
      body: payload.body || '수유 시간이 되었어요.',
      tag: payload.tag || 'sol-log-feeding',
      renotify: true,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: payload.url || '/' },
    }),
  )
})

// 알림 클릭 -> 이미 열린 탭이 있으면 포커스, 없으면 새로 연다
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus()
        }
        if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
        return undefined
      }),
  )
})
