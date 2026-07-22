import { Bell, BellOff } from 'lucide-react'
import { formatMinutesDuration } from '@/utils/dashboardStats'
import { toLocalTimeValue } from '@/utils/dateTime'

/** 다음 수유 예상 + 알람 토글 카드 (Pure Component) */
function NextFeedingCard({ alarm }) {
  const {
    enabled,
    toggleEnabled,
    permission,
    pushError,
    pushSupported,
    intervalMinutes,
    isAuto,
    dueAt,
    minutesLeft,
    hasFeedingLog,
  } = alarm

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-stone-500">
            다음 수유 예상
            <span className="ml-1.5 rounded-md bg-[#F7F1E8] px-1.5 py-0.5 text-[10px] font-semibold text-stone-500">
              {isAuto
                ? `최근 텀 ${formatMinutesDuration(intervalMinutes)} 기준`
                : '기본 3시간 기준'}
            </span>
          </p>

          {!hasFeedingLog ? (
            <p className="mt-1.5 text-sm text-stone-600">
              수유 기록이 쌓이면 예상 시각을 알려드려요.
            </p>
          ) : minutesLeft >= 0 ? (
            <p className="mt-1.5 text-xl font-bold text-stone-800">
              {toLocalTimeValue(dueAt)}
              <span className="ml-2 text-sm font-semibold text-[#2F6B45]">
                {minutesLeft < 1
                  ? '곧 수유 시간'
                  : `${formatMinutesDuration(minutesLeft)} 남음`}
              </span>
            </p>
          ) : (
            <p className="mt-1.5 text-xl font-bold text-[#B4552D]">
              {formatMinutesDuration(-minutesLeft)} 지남
              <span className="ml-2 text-sm font-semibold text-stone-500">
                (예상 {toLocalTimeValue(dueAt)})
              </span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={toggleEnabled}
          aria-pressed={enabled}
          className={`flex min-h-12 min-w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-3 transition-colors ${
            enabled
              ? 'bg-[#3D8B5A] text-white shadow-sm'
              : 'bg-[#FDFBF7] text-stone-500 ring-1 ring-[#E8E2D9]'
          }`}
        >
          {enabled ? <Bell size={16} /> : <BellOff size={16} />}
          <span className="text-xs font-semibold">
            {enabled ? '알람 켜짐' : '알람 꺼짐'}
          </span>
        </button>
      </div>

      {enabled && permission === 'denied' && (
        <p className="mt-2 rounded-xl bg-[#F7F1E8] px-3 py-2 text-xs leading-relaxed text-stone-500">
          브라우저 알림 권한이 거부되어 있어 앱 안 토스트로만 알려드려요. 주소창
          자물쇠 아이콘에서 알림을 허용하면 시스템 알림도 받을 수 있어요.
        </p>
      )}
      {enabled && permission === 'unsupported' && (
        <p className="mt-2 rounded-xl bg-[#F7F1E8] px-3 py-2 text-xs leading-relaxed text-stone-500">
          이 브라우저는 시스템 알림을 지원하지 않아 앱 안 토스트로 알려드려요.
          iPhone은 Safari 공유 → 홈 화면에 추가 후 그 앱에서 알림을 지원해요.
        </p>
      )}
      {enabled && pushError && (
        <p className="mt-2 rounded-xl bg-[#F7F1E8] px-3 py-2 text-xs leading-relaxed text-stone-500">
          서버 알림 준비 중이에요 ({pushError}) — 우선 앱이 열려 있는 동안은
          정상 동작해요.
        </p>
      )}
      {enabled && (
        <p className="mt-2 text-[11px] text-stone-400">
          {pushSupported && !pushError
            ? '앱을 꺼도 서버 푸시로 알려드려요. 앱을 열면 시스템 알림은 다시 울리지 않고, 필요할 때만 앱 안 안내를 보여요.'
            : '앱이 열려 있는 동안 동작하며, 시간이 지나면 15분 간격으로 다시 알려드려요.'}
        </p>
      )}
    </div>
  )
}

export default NextFeedingCard
