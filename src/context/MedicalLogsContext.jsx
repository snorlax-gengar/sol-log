import { createContext, useContext } from 'react'
import { useMedicalLogs } from '@/hooks/useMedicalLogs'

const MedicalLogsContext = createContext(null)

/**
 * 진료/예약 기록의 단일 소스.
 * Home(성장 그래프)과 Medical 탭이 이 인스턴스를 공유하므로,
 * 한 곳에서 기록을 넣으면 Realtime을 기다리지 않고 즉시 양쪽이 갱신된다.
 */
export function MedicalLogsProvider({ children }) {
  const medicalLogs = useMedicalLogs({ enableRealtime: true })

  return (
    <MedicalLogsContext.Provider value={medicalLogs}>
      {children}
    </MedicalLogsContext.Provider>
  )
}

export function useMedicalLogsContext() {
  const context = useContext(MedicalLogsContext)
  if (!context) {
    throw new Error(
      'useMedicalLogsContext는 MedicalLogsProvider 안에서만 사용할 수 있습니다.',
    )
  }
  return context
}
