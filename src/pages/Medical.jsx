import { useEffect, useMemo, useRef, useState } from 'react'
import MedicalForm from '@/components/medical/MedicalForm'
import MedicalCard from '@/components/medical/MedicalCard'
import ChipButton from '@/components/quickLog/ChipButton'
import { useMedicalLogsContext } from '@/context/MedicalLogsContext'
import { useToast } from '@/components/ui/ToastProvider'

const AUTO_PROMOTE_INTERVAL_MS = 60_000

function Medical() {
  const [tab, setTab] = useState('records')
  const [editingLog, setEditingLog] = useState(null)
  const formRef = useRef(null)
  const promotingRef = useRef(false)
  const { showToast } = useToast()
  const {
    logs,
    isLoading,
    isSaving,
    error,
    insertMedicalLog,
    updateMedicalLog,
    deleteMedicalLog,
    promoteToRecord,
    promoteDueAppointments,
  } = useMedicalLogsContext()

  const dueUpcomingCount = useMemo(
    () =>
      logs.filter(
        (log) =>
          Boolean(log.is_upcoming) &&
          new Date(log.visit_date).getTime() <= Date.now(),
      ).length,
    [logs],
  )

  const filteredLogs = useMemo(() => {
    const isUpcomingTab = tab === 'upcoming'
    return logs
      .filter((log) => Boolean(log.is_upcoming) === isUpcomingTab)
      .sort((a, b) => {
        const diff = new Date(a.visit_date) - new Date(b.visit_date)
        return isUpcomingTab ? diff : -diff
      })
  }, [logs, tab])

  // 방문 시각이 지난 예약 → 진료 기록 자동 이동
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (promotingRef.current || isLoading) return
      const due = logs.filter(
        (log) =>
          Boolean(log.is_upcoming) &&
          new Date(log.visit_date).getTime() <= Date.now(),
      )
      if (due.length === 0) return

      promotingRef.current = true
      const { moved, error: promoteError } = await promoteDueAppointments(logs)
      promotingRef.current = false
      if (cancelled || promoteError || moved === 0) return

      showToast(
        moved === 1
          ? '지난 예약을 진료 기록으로 옮겼어요.'
          : `지난 예약 ${moved}건을 진료 기록으로 옮겼어요.`,
      )
    }

    run()
    const timer = setInterval(run, AUTO_PROMOTE_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') run()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [logs, isLoading, promoteDueAppointments, showToast])

  const handleDelete = async (log) => {
    const confirmed = window.confirm('이 기록을 삭제할까요?')
    if (!confirmed) return
    await deleteMedicalLog(log.id)
    if (editingLog?.id === log.id) setEditingLog(null)
  }

  const handleToggleMedicine = async (log) => {
    await updateMedicalLog(log.id, {
      medicine_checked: !log.medicine_checked,
    })
  }

  const handlePromote = async (log) => {
    const label = log.diagnosis || '이 예약'
    const confirmed = window.confirm(
      `「${label}」을(를) 진료 기록 탭으로 옮길까요?`,
    )
    if (!confirmed) return

    const { error: promoteError } = await promoteToRecord(log.id)
    if (promoteError) {
      showToast(promoteError, 'error')
      return
    }
    showToast('진료 기록으로 옮겼어요.')
    setTab('records')
  }

  const handleEdit = (log) => {
    setEditingLog(log)
    // 폼은 화면 상단에 있으므로, 수정 시작 시 폼이 보이도록 스크롤
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSaveEdit = async (patch) => {
    const result = await updateMedicalLog(editingLog.id, patch)
    return result
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">메디컬</h1>
        <p className="mt-1 text-sm text-stone-500">
          진료 기록과 예약 일정을 관리하고 성장 지표를 남겨요.
        </p>
      </div>

      {!editingLog && (
        <div className="grid grid-cols-2 gap-2">
          <ChipButton
            selected={tab === 'records'}
            onClick={() => setTab('records')}
            className="w-full"
          >
            진료 기록
          </ChipButton>
          <ChipButton
            selected={tab === 'upcoming'}
            onClick={() => setTab('upcoming')}
            className="w-full"
          >
            예약/접종
            {dueUpcomingCount > 0 && (
              <span className="ml-1 rounded-md bg-[#B4552D] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {dueUpcomingCount}
              </span>
            )}
          </ChipButton>
        </div>
      )}

      {tab === 'upcoming' && dueUpcomingCount > 0 && !editingLog && (
        <p className="rounded-xl bg-[#F7E8D8] px-3 py-2.5 text-xs leading-relaxed text-[#8A4A2A]">
          방문 시각이 지난 예약 {dueUpcomingCount}건은 자동으로 진료 기록으로
          옮겨져요. 카드의 버튼으로 직접 옮길 수도 있어요.
        </p>
      )}

      <div ref={formRef}>
        <MedicalForm
          key={editingLog?.id ?? tab}
          isUpcoming={tab === 'upcoming'}
          isSaving={isSaving}
          onSubmit={insertMedicalLog}
          editingLog={editingLog}
          onSave={handleSaveEdit}
          onCancelEdit={() => setEditingLog(null)}
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="rounded-2xl bg-[#E6F4EA] px-4 py-5 text-sm text-stone-600">
          불러오는 중…
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-2xl bg-[#E6F4EA] px-4 py-5 text-sm text-stone-600">
          {tab === 'upcoming'
            ? '등록된 예약/접종이 없습니다.'
            : '등록된 진료 기록이 없습니다.'}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filteredLogs.map((log) => (
            <li key={log.id}>
              <MedicalCard
                log={log}
                isBusy={isSaving}
                onDelete={handleDelete}
                onToggleMedicine={handleToggleMedicine}
                onEdit={handleEdit}
                onPromote={handlePromote}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Medical
