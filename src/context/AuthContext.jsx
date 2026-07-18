import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 세션 복원 + 변경 구독
  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (!data.session) setIsLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession)
        if (!nextSession) {
          setProfile(null)
          setIsLoading(false)
        }
      },
    )

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  // 로그인 후 프로필(역할) 로드
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return undefined

    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, role')
        .eq('id', userId)
        .single()

      if (cancelled) return
      setProfile(
        data ?? { id: userId, display_name: '', role: 'parent' },
      )
      setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const signIn = useCallback(async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        const message =
          error.message === 'Invalid login credentials'
            ? '비밀번호가 맞지 않아요. 다시 확인해주세요.'
            : error.message
        return { error: message }
      }
      return { error: null }
    } catch (err) {
      return { error: err?.message || '로그인에 실패했습니다.' }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // 세션 만료 등은 무시 (onAuthStateChange가 정리)
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? 'parent',
      displayName: profile?.display_name || '',
      isLoading,
      signIn,
      signOut,
    }),
    [session, profile, isLoading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.')
  }
  return context
}
