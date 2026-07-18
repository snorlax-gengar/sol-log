import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getDefaultChildId, requireChildId } from '@/lib/childId'
import { formToDbPayload } from '@/utils/careLogFormat'

// 같은 이름의 채널은 인스턴스가 재사용되므로(이미 subscribe된 채널에 .on()을
// 걸면 크래시), 훅 인스턴스마다 고유한 채널 이름을 쓴다.
let channelSeq = 0

function sortByLoggedAtDesc(logs) {
  return [...logs].sort(
    (a, b) => new Date(b.logged_at) - new Date(a.logged_at),
  )
}

export function useCareLogs({ enableRealtime = false } = {}) {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchCareLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const childId = getDefaultChildId()
      if (!childId) {
        setLogs([])
        setError(
          'VITE_DEFAULT_CHILD_ID가 없습니다. .env에 children.id를 설정해주세요.',
        )
        return []
      }

      const { data, error: fetchError } = await supabase
        .from('care_logs')
        .select('*')
        .eq('child_id', childId)
        .order('logged_at', { ascending: false })

      if (fetchError) throw fetchError
      setLogs(data || [])
      return data || []
    } catch (err) {
      const message = err?.message || '기록을 불러오지 못했습니다.'
      setError(message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCareLogs()
  }, [fetchCareLogs])

  // 앱이 포그라운드로 돌아오면(밤새 백그라운드였다가 아침에 다시 열기 등)
  // Realtime으로 놓친 변경이 있을 수 있으므로 최신 데이터를 다시 불러온다.
  useEffect(() => {
    const refetchIfVisible = () => {
      if (document.visibilityState === 'visible') fetchCareLogs()
    }
    document.addEventListener('visibilitychange', refetchIfVisible)
    window.addEventListener('focus', refetchIfVisible)
    return () => {
      document.removeEventListener('visibilitychange', refetchIfVisible)
      window.removeEventListener('focus', refetchIfVisible)
    }
  }, [fetchCareLogs])

  useEffect(() => {
    if (!enableRealtime) return undefined

    const childId = getDefaultChildId()
    if (!childId) return undefined

    channelSeq += 1
    const channel = supabase
      .channel(`care_logs:${childId}:${channelSeq}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_logs',
          filter: `child_id=eq.${childId}`,
        },
        (payload) => {
          setLogs((prev) => {
            if (payload.eventType === 'INSERT') {
              const exists = prev.some((log) => log.id === payload.new.id)
              if (exists) return prev
              return sortByLoggedAtDesc([payload.new, ...prev])
            }

            if (payload.eventType === 'UPDATE') {
              return sortByLoggedAtDesc(
                prev.map((log) =>
                  log.id === payload.new.id ? payload.new : log,
                ),
              )
            }

            if (payload.eventType === 'DELETE') {
              return prev.filter((log) => log.id !== payload.old.id)
            }

            return prev
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enableRealtime])

  const insertCareLog = useCallback(async (form) => {
    setIsSaving(true)
    setError(null)

    try {
      const childId = requireChildId()
      const { data, error: insertError } = await supabase
        .from('care_logs')
        .insert({
          child_id: childId,
          ...formToDbPayload(form),
        })
        .select()
        .single()

      if (insertError) throw insertError

      setLogs((prev) => sortByLoggedAtDesc([data, ...prev]))
      return { data, error: null }
    } catch (err) {
      const message = err?.message || '기록 저장에 실패했습니다.'
      setError(message)
      return { data: null, error: message }
    } finally {
      setIsSaving(false)
    }
  }, [])

  const updateCareLog = useCallback(async (id, form) => {
    setIsSaving(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('care_logs')
        .update(formToDbPayload(form))
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setLogs((prev) =>
        sortByLoggedAtDesc(
          prev.map((log) => (log.id === id ? data : log)),
        ),
      )
      return { data, error: null }
    } catch (err) {
      const message = err?.message || '기록 수정에 실패했습니다.'
      setError(message)
      return { data: null, error: message }
    } finally {
      setIsSaving(false)
    }
  }, [])

  const deleteCareLog = useCallback(async (id) => {
    setIsSaving(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('care_logs')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setLogs((prev) => prev.filter((log) => log.id !== id))
      return { error: null }
    } catch (err) {
      const message = err?.message || '기록 삭제에 실패했습니다.'
      setError(message)
      return { error: message }
    } finally {
      setIsSaving(false)
    }
  }, [])

  return {
    logs,
    isLoading,
    isSaving,
    error,
    setError,
    fetchCareLogs,
    insertCareLog,
    updateCareLog,
    deleteCareLog,
  }
}
