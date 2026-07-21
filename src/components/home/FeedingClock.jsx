import { useState } from 'react'
import { BOTTLE_ML_TYPES, BREAST_TYPES } from '@/constants/careLog'
import { formatMinutesDuration } from '@/utils/dashboardStats'
import { toLocalTimeValue } from '@/utils/dateTime'

const SIZE = 300
const C = SIZE / 2

// 어린이 방학계획표처럼: 하루(24시간) 원을 실제 수유~다음 수유까지의
// "간격"만큼 색칠된 조각으로 채운다. (조각 폭 = 실제 시간 간격, 임의 고정폭 아님)
const R_INNER = 46 // 도넛 안쪽 반지름 (가운데 텍스트 공간)
const R_OUTER = 110 // 도넛 바깥 반지름

// 라벨은 조각 영역 바깥 고정 위치에 그린다.
const R_LABEL = 131

const KIND_COLOR = {
  formula: '#F6B8CE', // 분유 (연분홍)
  pumped: '#FBE38B', // 모유 (연노랑)
  food: '#B7E4C7', // 이유식 (연초록)
  multi: '#AAD4F0', // 분유+모유 (연파랑)
  breast: '#3D8B5A', // 직접 수유 (과거 기록 호환용)
}

const LEGEND_ITEMS = [
  { kind: 'formula', label: '분유' },
  { kind: 'pumped', label: '모유' },
  { kind: 'food', label: '이유식' },
  { kind: 'multi', label: '분유+모유' },
]

const KIND_LABEL = {
  formula: '분유',
  pumped: '모유',
  food: '이유식',
  breast: '직접 수유',
  multi: '분유+모유',
}

const BOTTLE_META = new Map(BOTTLE_ML_TYPES.map((item) => [item.value, item]))
const BREAST_TYPE_META = new Map(BREAST_TYPES.map((item) => [item.value, item]))

// 조각 상세 정보를 줄 단위 목록으로 분해 (예: ["🍼 분유 70ml", "🤱 직접수유"]).
// 2개 이상이면 화면에서 "+"로 이어 각각 줄바꿈해 표시한다 (단어 중간에서 잘리지 않도록).
function feedingDetailChunks(parts) {
  const chunks = []
  if (parts?.breast?.type) {
    const meta = BREAST_TYPE_META.get(parts.breast.type)
    chunks.push(`${meta?.emoji ?? '🤱'} ${meta?.label ?? parts.breast.type}`)
  } else if (parts?.breast?.minutes) {
    chunks.push(`직접 수유 ${parts.breast.minutes}분`)
  }
  parts?.bottles?.forEach((b) => {
    const meta = BOTTLE_META.get(b.type)
    chunks.push(`${meta?.emoji ?? '🍼'} ${meta?.label ?? b.type} ${b.ml}ml`)
  })
  return chunks.length > 0 ? chunks : ['기록 없음']
}

// 24시간제: 0시를 12시 방향(위쪽)에 두고 시계방향으로 배치
function pointAt(hour, radius) {
  const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2
  return {
    x: C + radius * Math.cos(angle),
    y: C + radius * Math.sin(angle),
  }
}

// 도넛 조각(파이 웨지) path: startHour ~ endHour 구간을 안쪽 반지름 rInner ~
// 바깥 반지름 rOuter로 채운다. (구간이 12시간을 넘을 수도 있어 largeArc 계산 필요)
function arcSectorPath(startHour, endHour, rInner, rOuter) {
  const largeArc = endHour - startHour > 12 ? 1 : 0
  const outerStart = pointAt(startHour, rOuter)
  const outerEnd = pointAt(endHour, rOuter)
  const innerEnd = pointAt(endHour, rInner)
  const innerStart = pointAt(startHour, rInner)
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

/**
 * 수유 시각들을 "이번 수유 ~ 다음 수유 전까지" 구간(segment)으로 변환한다.
 * 마지막 수유는 지금(now)까지로, 첫 수유 이전과 지금 이후는 빈 채로 남는다
 * (아직 기록 전/아직 안 온 시간이므로 배경색 그대로 노출).
 */
function buildSegments(times, nowHour) {
  const sorted = [...times].sort((a, b) => a.hour - b.hour)
  const segments = []
  sorted.forEach((t, i) => {
    const startHour = t.hour
    const endHour = i + 1 < sorted.length ? sorted[i + 1].hour : nowHour
    if (endHour > startHour) {
      segments.push({ startHour, endHour, kind: t.kind, at: t.at, parts: t.parts })
    }
  })
  return segments
}

/** 오늘 수유 시각을 방학계획표 스타일의 24시간 파이 시계로 표시 */
function FeedingClock({ times }) {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const now = new Date()
  const nowHour = now.getHours() + now.getMinutes() / 60
  const segments = buildSegments(times, nowHour)
  const selected = selectedIndex != null ? segments[selectedIndex] : null

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-stone-800">오늘 수유 시간표</h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-stone-500">
          {LEGEND_ITEMS.map((item) => (
            <span key={item.kind} className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: KIND_COLOR[item.kind] }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {times.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">
          오늘 수유 기록이 아직 없어요.
        </p>
      ) : (
        <>
          <div className="flex justify-center">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-64 w-64">
              {/* 도넛 배경 (하루 전체 — 기록 없는 시간은 이 색 그대로 보임) */}
              <circle
                cx={C}
                cy={C}
                r={(R_INNER + R_OUTER) / 2}
                fill="none"
                stroke="#F1ECE3"
                strokeWidth={R_OUTER - R_INNER}
              />
              <circle cx={C} cy={C} r={R_INNER} fill="none" stroke="#E8E2D9" strokeWidth="1" />
              <circle cx={C} cy={C} r={R_OUTER} fill="none" stroke="#E8E2D9" strokeWidth="1" />

              {/* 수유~다음 수유 구간 (실제 간격만큼 색칠, 탭/커서로 상세 정보 확인) */}
              {segments.map((seg, i) => (
                <path
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  d={arcSectorPath(seg.startHour, seg.endHour, R_INNER, R_OUTER)}
                  fill={KIND_COLOR[seg.kind] ?? KIND_COLOR.multi}
                  stroke="#fff"
                  strokeWidth="1.5"
                  className="cursor-pointer"
                  onMouseEnter={() => setSelectedIndex(i)}
                  onMouseLeave={() => setSelectedIndex(null)}
                  onClick={() => setSelectedIndex((cur) => (cur === i ? null : i))}
                >
                  <title>{`${toLocalTimeValue(seg.at)} ${KIND_LABEL[seg.kind] ?? ''}`}</title>
                </path>
              ))}

              {/* 0/6/12/18시 구분선 + 라벨: 흰색 테두리로 어떤 색 위에서도 잘 보이게 */}
              {[0, 6, 12, 18].map((hour) => {
                const inner = pointAt(hour, R_INNER - 6)
                const outer = pointAt(hour, R_OUTER + 8)
                const label = pointAt(hour, R_LABEL)
                return (
                  <g key={hour}>
                    <line
                      x1={inner.x}
                      y1={inner.y}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="#fff"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <line
                      x1={inner.x}
                      y1={inner.y}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="#B5A88F"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx={label.x} cy={label.y} r="15" fill="#fff" />
                    <text
                      x={label.x}
                      y={label.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="13"
                      fill="#8B8378"
                      fontWeight="700"
                    >
                      {hour}시
                    </text>
                  </g>
                )
              })}

              {/* 지금(현재 시각) 표시 — 색칠된 구간이 끝나는 지점 */}
              {(() => {
                const nowInner = pointAt(nowHour, R_INNER - 6)
                const nowOuter = pointAt(nowHour, R_OUTER + 14)
                const nowLabel = pointAt(nowHour, R_OUTER + 24)
                return (
                  <g>
                    <line
                      x1={nowInner.x}
                      y1={nowInner.y}
                      x2={nowOuter.x}
                      y2={nowOuter.y}
                      stroke="#57534E"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <circle cx={nowLabel.x} cy={nowLabel.y} r="13" fill="#fff" />
                    <text
                      x={nowLabel.x}
                      y={nowLabel.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="10"
                      fill="#57534E"
                      fontWeight="700"
                    >
                      지금
                    </text>
                  </g>
                )
              })()}

              {/* 가운데: 오늘 수유 횟수 */}
              <text
                x={C}
                y={C - 8}
                textAnchor="middle"
                fontSize="30"
                fontWeight="800"
                fill="#292524"
              >
                {times.length}
              </text>
              <text x={C} y={C + 14} textAnchor="middle" fontSize="11" fill="#78716c">
                오늘 수유
              </text>
            </svg>
          </div>

          {/* 탭/커서로 선택한 조각의 상세 정보 */}
          <div className="mt-2 flex h-20 items-center justify-center rounded-xl bg-[#FDFBF7] px-3 py-2 text-center text-xs text-stone-600 ring-1 ring-[#E8E2D9]/70">
            {selected ? (
              (() => {
                const chunks = feedingDetailChunks(selected.parts)
                const isOngoing = selectedIndex === segments.length - 1
                const durationLabel = formatMinutesDuration(
                  Math.round((selected.endHour - selected.startHour) * 60),
                )
                return (
                  <div className="flex flex-col items-center gap-0.5">
                    {/* 기록 내용: 한 줄 (칸 부족하면 "+" 앞에서만 줄바꿈, 단어 중간 X) */}
                    <p>
                      <span className="font-semibold text-stone-800">
                        {toLocalTimeValue(selected.at)}
                      </span>
                      {' · '}
                      {chunks.map((chunk, i) => (
                        <span key={chunk} className="whitespace-nowrap">
                          {i > 0 && ' + '}
                          {chunk}
                        </span>
                      ))}
                    </p>
                    {/* 설명 문구: 다음 줄 */}
                    <p className="text-stone-400">
                      {isOngoing
                        ? `이 수유 이후 지금까지 ${durationLabel} 경과`
                        : `다음 수유까지 ${durationLabel} (수유 간격)`}
                    </p>
                  </div>
                )
              })()
            ) : (
              <span className="text-stone-400">조각을 탭하면 상세 정보를 볼 수 있어요.</span>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default FeedingClock
