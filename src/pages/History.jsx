import { useMemo, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import CareLogCard from '@/components/history/CareLogCard'
import EditCareLogModal from '@/components/history/EditCareLogModal'
import { useCareLogs } from '@/hooks/useCareLogs'
import { useToast } from '@/components/ui/ToastProvider'
import {
  formatMinutesDuration,
  getFeedingIntervalMap,
} from '@/utils/dashboardStats'

function IntervalLabel({ minutes }) {
  return (
    <div className="mb-2 flex items-center gap-2 px-1">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E6F4EA] text-[#3D8B5A]">
        <ArrowUp size={12} />
      </span>
      <p className="text-xs font-medium text-[#2F6B45]">
        이전 수유로부터 +{formatMinutesDuration(minutes)}
      </p>
      <span className="h-px flex-1 bg-[#E8E2D9]" />
    </div>
  )
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
          최신 기록이 위로 오고, 부부 간 실시간으로 동기화됩니다.
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
        <ul className="flex flex-col gap-3">
          {logs.map((log) => {
            const intervalMinutes = intervalMap.get(log.id)
            return (
              <li key={log.id}>
                {intervalMinutes != null && (
                  <IntervalLabel minutes={intervalMinutes} />
                )}
                <CareLogCard
                  log={log}
                  isBusy={isSaving}
                  onEdit={setEditingLog}
                  onDelete={handleDelete}
                />
              </li>
            )
          })}
        </ul>
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
