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

function PatternCharts({ hourlyPattern, weightTrend }) {
  const hasFeedingData = hourlyPattern.some((item) => item.count > 0)
  const hasWeightData = weightTrend.length > 0

  return (
    <div className="flex flex-col gap-3">
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
