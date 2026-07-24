import { createContext, useContext, useState } from 'react'
import {
  DEFAULT_HOME_VISIBILITY,
  loadHomeVisibility,
  saveHomeVisibility,
} from '@/utils/homeVisibility'

const HomeVisibilityContext = createContext(null)

/**
 * 홈 화면 섹션 on/off. 기기 localStorage에만 저장 (부부 동기화 없음).
 */
export function HomeVisibilityProvider({ children }) {
  const [visibility, setVisibility] = useState(loadHomeVisibility)

  const setVisible = (key, enabled) => {
    setVisibility((prev) => {
      const next = { ...prev, [key]: Boolean(enabled) }
      return saveHomeVisibility(next)
    })
  }

  const resetToDefault = () => {
    setVisibility(saveHomeVisibility({ ...DEFAULT_HOME_VISIBILITY }))
  }

  return (
    <HomeVisibilityContext.Provider
      value={{ visibility, setVisible, resetToDefault }}
    >
      {children}
    </HomeVisibilityContext.Provider>
  )
}

export function useHomeVisibility() {
  const ctx = useContext(HomeVisibilityContext)
  if (!ctx) {
    throw new Error(
      'useHomeVisibility는 HomeVisibilityProvider 안에서만 사용할 수 있습니다.',
    )
  }
  return ctx
}
