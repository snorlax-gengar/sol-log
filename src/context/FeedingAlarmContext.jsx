import { createContext, useContext } from 'react'
import { useFeedingAlarm } from '@/hooks/useFeedingAlarm'
import { useToast } from '@/components/ui/ToastProvider'
import { useCareLogsContext } from '@/context/CareLogsContext'

const FeedingAlarmContext = createContext(null)

/**
 * 앱 전역 수유 알람. 공유 CareLogsProvider의 기록을 그대로 사용하므로
 * 어느 화면에서 기록해도 즉시 다음 수유 예상/알람에 반영된다.
 */
export function FeedingAlarmProvider({ children }) {
  const { logs } = useCareLogsContext()
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
