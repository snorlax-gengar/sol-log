import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getDefaultChildId, requireChildId } from '@/lib/childId'

function sortByVisitDateDesc(logs) {
  return [...logs].sort(
    (a, b) => new Date(b.visit_date) - new Date(a.visit_date),
  )
}

// useCareLogs와 동일: 채널 이름 재사용 크래시 방지용 시퀀스
let channelSeq = 0

export function useMedicalLogs({ enableRealtime = false } = {}) {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchMedicalLogs = useCallback(async () => {
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
        .from('medical_logs')
        .select('*')
        .eq('child_id', childId)
        .order('visit_date', { ascending: false })

      if (fetchError) throw fetchError
      setLogs(data || [])
      return data || []
    } catch (err) {
      const message = err?.message || '진료 기록을 불러오지 못했습니다.'
      setError(message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMedicalLogs()
  }, [fetchMedicalLogs])

  // 포그라운드 복귀 시 놓친 변경을 다시 불러온다 (useCareLogs와 동일)
  useEffect(() => {
    const refetchIfVisible = () => {
      if (document.visibilityState === 'visible') fetchMedicalLogs()
    }
    document.addEventListener('visibilitychange', refetchIfVisible)
    window.addEventListener('focus', refetchIfVisible)
    return () => {
      document.removeEventListener('visibilitychange', refetchIfVisible)
      window.removeEventListener('focus', refetchIfVisible)
    }
  }, [fetchMedicalLogs])

  useEffect(() => {
    if (!enableRealtime) return undefined

    const childId = getDefaultChildId()
    if (!childId) return undefined

    channelSeq += 1
    const channel = supabase
      .channel(`medical_logs:${childId}:${channelSeq}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medical_logs',
          filter: `child_id=eq.${childId}`,
        },
        () => {
          fetchMedicalLogs()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enableRealtime, fetchMedicalLogs])

  const insertMedicalLog = useCallback(async (payload) => {
    setIsSaving(true)
    setError(null)

    try {
      const childId = requireChildId()
      const { data, error: insertError } = await supabase
        .from('medical_logs')
        .insert({
          child_id: childId,
          visit_date: payload.visitDate.toISOString(),
          hospital_name: payload.hospitalName || null,
          department: payload.department || null,
          doctor_name: payload.doctorName || null,
          symptoms: payload.symptoms || null,
          diagnosis: payload.diagnosis || null,
          baby_weight_kg: payload.babyWeightKg,
          baby_height_cm: payload.babyHeightCm,
          is_upcoming: payload.isUpcoming,
          medicine_checked: payload.medicineChecked,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setLogs((prev) => sortByVisitDateDesc([data, ...prev]))
      return { data, error: null }
    } catch (err) {
      const message = err?.message || '진료 기록 저장에 실패했습니다.'
      setError(message)
      return { data: null, error: message }
    } finally {
      setIsSaving(false)
    }
  }, [])

  const updateMedicalLog = useCallback(async (id, patch) => {
    setIsSaving(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('medical_logs')
        .update(patch)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setLogs((prev) =>
        sortByVisitDateDesc(
          prev.map((log) => (log.id === id ? data : log)),
        ),
      )
      return { data, error: null }
    } catch (err) {
      const message = err?.message || '진료 기록 수정에 실패했습니다.'
      setError(message)
      return { data: null, error: message }
    } finally {
      setIsSaving(false)
    }
  }, [])

  const deleteMedicalLog = useCallback(async (id) => {
    setIsSaving(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('medical_logs')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setLogs((prev) => prev.filter((log) => log.id !== id))
      return { error: null }
    } catch (err) {
      const message = err?.message || '진료 기록 삭제에 실패했습니다.'
      setError(message)
      return { error: message }
    } finally {
      setIsSaving(false)
    }
  }, [])

  /** 예약을 진료 기록 탭으로 옮긴다 (is_upcoming=false). */
  const promoteToRecord = useCallback(async (id) => {
    return updateMedicalLog(id, { is_upcoming: false })
  }, [updateMedicalLog])

  /**
   * 방문 시각이 지난 예약을 일괄로 진료 기록으로 옮긴다.
   * @returns {{ moved: number, error: string | null }}
   */
  const promoteDueAppointments = useCallback(
    async (sourceLogs = logs) => {
      const now = Date.now()
      const dueIds = sourceLogs
        .filter(
          (log) =>
            Boolean(log.is_upcoming) && new Date(log.visit_date).getTime() <= now,
        )
        .map((log) => log.id)

      if (dueIds.length === 0) return { moved: 0, error: null }

      setIsSaving(true)
      setError(null)
      try {
        const { data, error: updateError } = await supabase
          .from('medical_logs')
          .update({ is_upcoming: false })
          .in('id', dueIds)
          .select()

        if (updateError) throw updateError

        const updatedById = new Map((data || []).map((row) => [row.id, row]))
        setLogs((prev) =>
          sortByVisitDateDesc(
            prev.map((log) => updatedById.get(log.id) || log),
          ),
        )
        return { moved: dueIds.length, error: null }
      } catch (err) {
        const message = err?.message || '예약 → 진료 이동에 실패했습니다.'
        setError(message)
        return { moved: 0, error: message }
      } finally {
        setIsSaving(false)
      }
    },
    [logs],
  )

  return {
    logs,
    isLoading,
    isSaving,
    error,
    setError,
    fetchMedicalLogs,
    insertMedicalLog,
    updateMedicalLog,
    deleteMedicalLog,
    promoteToRecord,
    promoteDueAppointments,
  }
}
