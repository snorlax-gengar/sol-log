import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function ChartCard({ title, children, empty }) {
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <h2 className="mb-3 text-sm font-semibold text-stone-800">{title}</h2>
      {empty ? (
        <p className="py-8 text-center text-sm text-stone-500">{empty}</p>
      ) : (
        <div className="h-52 w-full">{children}</div>
      )}
    </section>
  )
}

const HEAT_COLORS = ['#F5F1E8', '#A7D3B7', '#57A374', '#2F6B45'] // 0 / 1 / 2 / 3+

function Heatmap({ rows }) {
  return (
    <div>
      {rows.map((row) => (
        <div key={row.key} className="mb-1 flex items-center gap-1.5">
          <span className="w-9 shrink-0 text-right text-[10px] font-medium text-stone-400">
            {row.dateLabel}
          </span>
          <div className="grid flex-1 grid-cols-24 gap-[2px]">
            {row.counts.map((count, hour) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={hour}
                title={`${row.dateLabel} ${hour}시 · ${count}회`}
                className="h-4 rounded-[3px]"
                style={{
                  backgroundColor:
                    HEAT_COLORS[Math.min(count, HEAT_COLORS.length - 1)],
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 시간축 */}
      <div className="flex items-center gap-1.5">
        <span className="w-9 shrink-0" />
        <div className="grid flex-1 grid-cols-24">
          {Array.from({ length: 24 }, (_, hour) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={hour}
              className="text-center text-[9px] text-stone-400"
            >
              {hour % 6 === 0 ? hour : ''}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-2 flex items-center justify-end gap-1 text-[10px] text-stone-400">
        적음
        {HEAT_COLORS.map((color) => (
          <span
            key={color}
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: color }}
          />
        ))}
        많음
      </p>
    </div>
  )
}

function PatternCharts({ hourlyPattern, weightTrend, dailyTotals, heatmap }) {
  const hasFeedingData = hourlyPattern.some((item) => item.count > 0)
  const hasWeightData = weightTrend.length > 0
  const hasDailyData = dailyTotals.some((item) => item.count > 0)

  return (
    <div className="flex flex-col gap-3">
      <ChartCard
        title="일자별 총 수유량"
        empty={hasDailyData ? null : '수유 데이터가 쌓이면 추세가 보여요.'}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dailyTotals}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#78716c' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#78716c' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(61, 139, 90, 0.08)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E8E2D9',
                fontSize: 12,
              }}
              formatter={(value, _name, item) => {
                const { count = 0, breastMin = 0 } = item?.payload ?? {}
                const breast = breastMin > 0 ? ` · 모유 ${breastMin}분` : ''
                return [`${value}ml · ${count}회${breast}`, '수유']
              }}
            />
            <Bar dataKey="ml" name="수유량(ml)" fill="#3D8B5A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
        <h2 className="mb-3 text-sm font-semibold text-stone-800">
          날짜별 수유 리듬 (히트맵)
        </h2>
        {hasFeedingData ? (
          <Heatmap rows={heatmap} />
        ) : (
          <p className="py-8 text-center text-sm text-stone-500">
            수유 데이터가 쌓이면 밤낮 리듬이 보여요.
          </p>
        )}
      </section>
      <ChartCard
        title="최근 7일 수유 시간대 패턴"
        empty={hasFeedingData ? null : '수유 데이터가 쌓이면 패턴이 보여요.'}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyPattern} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: '#78716c' }}
              interval={3}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#78716c' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(61, 139, 90, 0.08)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E8E2D9',
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" name="수유 횟수" fill="#3D8B5A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="몸무게 변화"
        empty={hasWeightData ? null : '메디컬 탭에서 몸무게를 기록해보세요.'}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weightTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#78716c' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#78716c' }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 0.2', 'dataMax + 0.2']}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E8E2D9',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              name="몸무게(kg)"
              stroke="#3D8B5A"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#3D8B5A' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

export default PatternCharts
