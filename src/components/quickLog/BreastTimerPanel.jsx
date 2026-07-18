import { Check, Pause, Play, RotateCcw } from 'lucide-react'
import { formatTimerMs } from '@/hooks/useBreastTimer'

function SideTimerButton({ side, label, elapsedMs, isActive, hasElapsed, onToggle }) {
  const started = hasElapsed || isActive

  return (
    <button
      type="button"
      onClick={() => onToggle(side)}
      aria-pressed={isActive}
      className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-3 transition-colors ${
        isActive
          ? 'bg-[#3D8B5A] text-white shadow-md'
          : 'bg-white text-stone-700 ring-1 ring-[#E8E2D9] hover:bg-[#E6F4EA]/60'
      }`}
    >
      <span
        className={`text-xs font-semibold ${
          isActive ? 'text-white/90' : 'text-stone-500'
        }`}
      >
        {label}
      </span>
      <span className="font-mono text-2xl font-bold tabular-nums">
        {formatTimerMs(elapsedMs)}
      </span>
      <span
        className={`flex items-center gap-1 text-[11px] font-medium ${
          isActive ? 'text-white/90' : 'text-[#2F6B45]'
        }`}
      >
        {isActive ? (
          <>
            <Pause size={12} /> 일시정지
          </>
        ) : (
          <>
            <Play size={12} /> {started ? '재개' : '시작'}
          </>
        )}
      </span>
    </button>
  )
}

/**
 * 모유 수유 스톱워치 패널 (Pure Component).
 * 타이머 상태/로직은 부모의 useBreastTimer 훅이 소유한다.
 */
function BreastTimerPanel({ timer, onFinish }) {
  const {
    leftMs,
    rightMs,
    totalMs,
    activeSide,
    isRunning,
    hasMeasured,
    toggleSide,
    reset,
  } = timer

  return (
    <div className="rounded-xl bg-[#FDFBF7] p-3 ring-1 ring-[#E8E2D9]/80">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700">수유 타이머</p>
        <p className="text-sm font-semibold text-[#2F6B45]">
          총 {formatTimerMs(totalMs)}
          {isRunning && (
            <span className="ml-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-[#3D8B5A] align-middle" />
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SideTimerButton
          side="left"
          label="왼쪽"
          elapsedMs={leftMs}
          isActive={activeSide === 'left'}
          hasElapsed={leftMs > 0}
          onToggle={toggleSide}
        />
        <SideTimerButton
          side="right"
          label="오른쪽"
          elapsedMs={rightMs}
          isActive={activeSide === 'right'}
          hasElapsed={rightMs > 0}
          onToggle={toggleSide}
        />
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          disabled={!hasMeasured}
          onClick={onFinish}
          className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-[#3D8B5A] px-3.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-40"
        >
          <Check size={16} />
          완료 (시간 자동 입력)
        </button>
        <button
          type="button"
          disabled={!hasMeasured}
          onClick={reset}
          aria-label="타이머 초기화"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-white text-stone-500 ring-1 ring-[#E8E2D9] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-stone-400">
        버튼을 누르면 시작/일시정지, 반대쪽을 누르면 자동 전환됩니다. 완료 시
        측정된 분이 아래 입력값에 채워져요.
      </p>
    </div>
  )
}

export default BreastTimerPanel
