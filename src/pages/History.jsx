import { useMemo, useState } from 'react'
import CareLogRow from '@/components/history/CareLogRow'
import EditCareLogModal from '@/components/history/EditCareLogModal'
import { useCareLogs } from '@/hooks/useCareLogs'
import { useToast } from '@/components/ui/ToastProvider'
import { getFeedingIntervalMap } from '@/utils/dashboardStats'
import { formatShortDate, toLocalDateValue } from '@/utils/dateTime'

/** 최신순 로그를 날짜별 그룹으로 묶는다 (그룹, 그룹 내 모두 최신순 유지) */
function groupByDate(logs) {
  const groups = []
  const indexByDate = new Map()

  logs.forEach((log) => {
    const date = new Date(log.logged_at)
    const key = toLocalDateValue(date)

    if (!indexByDate.has(key)) {
      indexByDate.set(key, groups.length)
      groups.push({ key, label: formatShortDate(date), items: [] })
    }
    groups[indexByDate.get(key)].items.push(log)
  })

  return groups
}

function History() {
  const {
    logs,
    isLoading,
    isSaving,
    error,
    updateCareLog,
    deleteCareLog,
  } = useCareLogs({ enableRealtime: true })
  const [editingLog, setEditingLog] = useState(null)
  const { showToast } = useToast()

  // 수유 기록 id -> 직전 수유로부터의 간격(분)
  const intervalMap = useMemo(() => getFeedingIntervalMap(logs), [logs])
  const groups = useMemo(() => groupByDate(logs), [logs])

  const handleDelete = async (log) => {
    const confirmed = window.confirm('이 기록을 삭제할까요?')
    if (!confirmed) return

    const { error: deleteError } = await deleteCareLog(log.id)
    if (deleteError) {
      showToast(`삭제 실패: ${deleteError}`, 'error')
    } else {
      showToast('기록이 삭제되었습니다.')
    }
  }

  const handleSaveEdit = async (form) => {
    const result = await updateCareLog(editingLog.id, form)
    if (result.error) {
      showToast(`수정 실패: ${result.error}`, 'error')
    } else {
      setEditingLog(null)
      showToast('기록이 수정되었습니다.')
    }
    return result
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">타임라인</h1>
        <p className="mt-1 text-sm text-stone-500">
          최신 기록이 위로 오고, 부부 간 실시간으로 동기화됩니다. 줄을 누르면
          수정할 수 있어요.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="rounded-2xl bg-[#E6F4EA] px-4 py-5 text-sm text-stone-600">
          기록을 불러오는 중…
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl bg-[#E6F4EA] px-4 py-5 text-sm text-stone-600">
          아직 기록이 없습니다. 기록 탭에서 첫 로그를 남겨보세요.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.key}>
              {/* 일자 표시 + 구분선 */}
              <div className="mb-1 flex items-center gap-2.5">
                <p className="shrink-0 text-sm font-bold text-[#2F6B45]">
                  {group.label}
                </p>
                <span className="h-px flex-1 bg-[#E8E2D9]" aria-hidden />
                <span className="shrink-0 text-[11px] font-medium text-stone-400">
                  {group.items.length}건
                </span>
              </div>

              <ul className="rounded-2xl bg-white px-3 py-1 ring-1 ring-[#E8E2D9]">
                {group.items.map((log) => (
                  <CareLogRow
                    key={log.id}
                    log={log}
                    intervalMinutes={intervalMap.get(log.id) ?? null}
                    isBusy={isSaving}
                    onEdit={setEditingLog}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {editingLog && (
        <EditCareLogModal
          log={editingLog}
          isSaving={isSaving}
          onClose={() => setEditingLog(null)}
          onSave={handleSaveEdit}
        />
      )}
    </section>
  )
}

export default History
