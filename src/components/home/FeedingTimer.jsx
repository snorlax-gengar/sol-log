import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { formatElapsed } from '@/utils/dashboardStats'

function FeedingTimer({ lastFeedingAt }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // 매 분 단위 표시가 어긋나지 않도록 30초마다 갱신
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const elapsed = formatElapsed(lastFeedingAt, now)

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#E6F4EA] to-[#D8EDDF] px-4 py-4 ring-1 ring-[#BBDCC7]/60">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#3D8B5A]">
          <Timer size={22} />
        </span>
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#2F6B45]">
            마지막 수유로부터
          </p>
          {elapsed ? (
            <p className="mt-0.5 text-2xl font-bold text-stone-800">
              {elapsed}{' '}
              <span className="text-base font-semibold text-stone-500">
                경과
              </span>
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-stone-600">
              수유 기록이 아직 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedingTimer
