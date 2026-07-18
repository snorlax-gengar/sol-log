import { useCallback, useEffect, useRef, useState } from 'react'

export const WHEEL_ITEM_HEIGHT = 40
const VISIBLE_COUNT = 5
const PAD_HEIGHT = (WHEEL_ITEM_HEIGHT * (VISIBLE_COUNT - 1)) / 2
const SETTLE_FALLBACK_MS = 160
const VERIFY_MS = 120

/**
 * 텀블러식 휠 컬럼 (Pure Component).
 * - 굴리는 동안 중앙 항목이 실시간으로 하이라이트된다.
 * - 스크롤이 멈추면(scrollend 우선, 디바운스 폴백) 중앙 항목을 onChange로 확정한다.
 * - 부모가 값을 거부(미래 시간 클램프 등)하면 원래 위치로 부드럽게 복귀한다.
 */
function WheelColumn({ options, value, onChange, ariaLabel }) {
  const containerRef = useRef(null)
  const settleTimerRef = useRef(null)
  const verifyTimerRef = useRef(null)
  const programmaticRef = useRef(false)
  const valueRef = useRef(value)
  valueRef.current = value
  const optionsRef = useRef(options)
  optionsRef.current = options

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const [centerIndex, setCenterIndex] = useState(selectedIndex)

  const indexAtScrollTop = () => {
    const el = containerRef.current
    if (!el) return 0
    return Math.min(
      optionsRef.current.length - 1,
      Math.max(0, Math.round(el.scrollTop / WHEEL_ITEM_HEIGHT)),
    )
  }

  const scrollToIndex = useCallback((index, smooth = false) => {
    const el = containerRef.current
    if (!el) return
    const target = index * WHEEL_ITEM_HEIGHT
    if (Math.abs(el.scrollTop - target) < 1) return
    programmaticRef.current = true
    el.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  // 값을 부모에 제안하고, 거부되면(값이 그대로면) 원위치로 복귀
  const requestChange = useCallback(
    (option) => {
      if (!option || option.value === valueRef.current) return
      onChange(option.value)
      clearTimeout(verifyTimerRef.current)
      verifyTimerRef.current = setTimeout(() => {
        if (valueRef.current !== option.value) {
          const backIndex = Math.max(
            0,
            optionsRef.current.findIndex((o) => o.value === valueRef.current),
          )
          setCenterIndex(backIndex)
          scrollToIndex(backIndex, true)
        }
      }, VERIFY_MS)
    },
    [onChange, scrollToIndex],
  )

  const commit = useCallback(() => {
    if (programmaticRef.current) {
      programmaticRef.current = false
      return
    }
    requestChange(optionsRef.current[indexAtScrollTop()])
  }, [requestChange])

  // 외부 값 변경(퀵 버튼, 방금 전, 클램프) -> 위치·하이라이트 동기화
  useEffect(() => {
    setCenterIndex(selectedIndex)
    scrollToIndex(selectedIndex)
  }, [selectedIndex, options, scrollToIndex])

  // scrollend 지원 브라우저에서는 멈추는 즉시 확정
  useEffect(() => {
    const el = containerRef.current
    if (!el || !('onscrollend' in el)) return undefined
    const handleScrollEnd = () => {
      clearTimeout(settleTimerRef.current)
      commit()
    }
    el.addEventListener('scrollend', handleScrollEnd)
    return () => el.removeEventListener('scrollend', handleScrollEnd)
  }, [commit])

  useEffect(
    () => () => {
      clearTimeout(settleTimerRef.current)
      clearTimeout(verifyTimerRef.current)
    },
    [],
  )

  const handleScroll = () => {
    // 굴러가는 동안에도 중앙 항목을 실시간 하이라이트
    setCenterIndex(indexAtScrollTop())
    // scrollend 미지원 브라우저 폴백
    clearTimeout(settleTimerRef.current)
    settleTimerRef.current = setTimeout(commit, SETTLE_FALLBACK_MS)
  }

  return (
    <div
      className="relative min-w-0 flex-1"
      style={{ height: WHEEL_ITEM_HEIGHT * VISIBLE_COUNT }}
    >
      {/* 중앙 선택 밴드 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 z-0 rounded-xl bg-[#E6F4EA]/70"
        style={{ top: PAD_HEIGHT, height: WHEEL_ITEM_HEIGHT }}
      />

      <div
        ref={containerRef}
        role="listbox"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        className="wheel-column relative z-10 h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
      >
        <div style={{ height: PAD_HEIGHT }} />
        {options.map((option, index) => {
          const isCentered = index === centerIndex
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => {
                requestChange(option)
                scrollToIndex(index, true)
              }}
              className={`flex w-full snap-center items-center justify-center text-sm transition-colors duration-100 ${
                isCentered
                  ? 'font-bold text-[#2F6B45]'
                  : 'font-medium text-stone-400'
              }`}
              style={{ height: WHEEL_ITEM_HEIGHT }}
            >
              {option.label}
            </button>
          )
        })}
        <div style={{ height: PAD_HEIGHT }} />
      </div>

      {/* 위/아래 페이드 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-gradient-to-b from-[#FDFBF7] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-gradient-to-t from-[#FDFBF7] to-transparent"
      />
    </div>
  )
}

export default WheelColumn
