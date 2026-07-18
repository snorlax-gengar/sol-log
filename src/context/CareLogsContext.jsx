import { createContext, useContext } from 'react'
import { useCareLogs } from '@/hooks/useCareLogs'

const CareLogsContext = createContext(null)

/**
 * 수유/기저귀 기록의 단일 소스.
 * Home / History / QuickLog / 수유 알람이 모두 이 인스턴스를 공유하므로,
 * 한 곳에서 기록을 넣으면(insert) Realtime을 기다리지 않고 즉시 모든 화면이 갱신된다.
 */
export function CareLogsProvider({ children }) {
  const careLogs = useCareLogs({ enableRealtime: true })

  return (
    <CareLogsContext.Provider value={careLogs}>
      {children}
    </CareLogsContext.Provider>
  )
}

export function useCareLogsContext() {
  const context = useContext(CareLogsContext)
  if (!context) {
    throw new Error(
      'useCareLogsContext는 CareLogsProvider 안에서만 사용할 수 있습니다.',
    )
  }
  return context
}
