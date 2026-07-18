import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getDefaultChildId, setActiveChildId } from '@/lib/childId'
import Logo from '@/components/ui/Logo'

const ChildContext = createContext(null)

function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#FDFBF7]">
      <div className="animate-pulse">
        <Logo size={72} />
      </div>
    </div>
  )
}

/**
 * 로그인한 부모에 연결된 아이를 DB(children)에서 불러와 활성 아이로 설정.
 * 이후 useCareLogs/useMedicalLogs/푸시가 이 아이 ID를 사용한다.
 * (RLS상 부모는 children을 읽을 수 있음. 아이가 여럿이면 가장 먼저 등록된 아이.)
 */
export function ChildProvider({ children }) {
  const [child, setChild] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('children')
        .select('id, name, birth_date')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (cancelled) return

      if (data?.id) {
        setActiveChildId(data.id)
        setChild(data)
      } else {
        // DB에서 못 찾으면 env 폴백 유지
        setActiveChildId(null)
        const fallback = getDefaultChildId()
        setChild(fallback ? { id: fallback } : null)
      }
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) return <LoadingScreen />

  return <ChildContext.Provider value={child}>{children}</ChildContext.Provider>
}

export function useChild() {
  return useContext(ChildContext)
}
