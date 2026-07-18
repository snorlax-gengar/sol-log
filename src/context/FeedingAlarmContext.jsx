import { createContext, useContext } from 'react'
import { useCareLogs } from '@/hooks/useCareLogs'
import { useFeedingAlarm } from '@/hooks/useFeedingAlarm'
import { useToast } from '@/components/ui/ToastProvider'

const FeedingAlarmContext = createContext(null)

/**
 * 앱 전역 수유 알람. 어느 탭에 있어도 (앱이 열려 있는 동안) 알람이 동작하도록
 * AppShell 바깥 레벨에서 자체 Realtime 구독으로 기록을 추적한다.
 */
export function FeedingAlarmProvider({ children }) {
  const { logs } = useCareLogs({ enableRealtime: true })
  const { showToast } = useToast()
  const alarm = useFeedingAlarm(logs, { onAlarm: showToast })

  return (
    <FeedingAlarmContext.Provider value={alarm}>
      {children}
    </FeedingAlarmContext.Provider>
  )
}

export function useFeedingAlarmContext() {
  const context = useContext(FeedingAlarmContext)
  if (!context) {
    throw new Error(
      'useFeedingAlarmContext는 FeedingAlarmProvider 안에서만 사용할 수 있습니다.',
    )
  }
  return context
}
