import { useCallback, useEffect, useState } from "react"
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
} from "recharts"
import { useOutletContext } from "react-router-dom"
import { fetchBlocks, fetchDashboard, fetchVendors } from "../services/api"
import { useDarkMode } from "../context/ThemeContext"

function StatCard({ title, value, hint }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        {value}
      </p>
      {hint && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 font-mono">
          {hint}
        </p>
      )}
    </div>
  )
}

function Dashboard() {
  const { showToast } = useOutletContext() || {}
  const isDarkMode = useDarkMode()
  const [loading, setLoading] = useState(true)
  const [contractorTotal, setContractorTotal] = useState(0)
  const [blockTotal, setBlockTotal] = useState(0)
  const [todayTonnage, setTodayTonnage] = useState(0)
  const [barData, setBarData] = useState([])
  const [lineData, setLineData] = useState([])

  const getChartColors = () => {
    return {
      textColor: isDarkMode ? '#9ca3af' : '#6b7280',
      gridColor: isDarkMode ? '#374151' : '#e5e7eb',
      barColor: '#10b981', // Tailwind Emerald 500
      tooltipBg: isDarkMode ? '#1f2937' : '#ffffff',
      tooltipBorder: isDarkMode ? '#374151' : '#e5e7eb',
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [vendorsRes, blocksRes, dash] = await Promise.all([
        fetchVendors({ skip: 0, limit: 1 }),
        fetchBlocks({ skip: 0, limit: 1 }),
        fetchDashboard(),
      ])

      const vTotal = typeof vendorsRes.total === "number" ? vendorsRes.total : 0
      const bTotal = typeof blocksRes.total === "number" ? blocksRes.total : 0
      setContractorTotal(vTotal)
      setBlockTotal(bTotal)

      const ton = dash?.today?.total_tonage
      setTodayTonnage(typeof ton === "number" ? ton : 0)

      const mtdT = Number(dash?.mtd?.total_tonage ?? 0)
      const todayT = Number(dash?.today?.total_tonage ?? 0)
      const target = Number(dash?.mtd?.target_tonage ?? 500)

      setBarData([
        { name: "Today (t)", value: Number(todayT.toFixed(2)) },
        { name: "MTD (t)", value: Number(mtdT.toFixed(2)) },
        { name: "Target (t)", value: Number(target.toFixed(2)) },
      ])

      const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"]
      setLineData(
        weeks.map((name, i) => ({
          name,
          ton: Number(((mtdT * (i + 1)) / 6).toFixed(1)),
        })),
      )
    } catch (err) {
      if (err.message !== "UNAUTHORIZED") {
        showToast?.(err.message || "Gagal memuat dashboard", "error")
      }
      setBarData([
        { name: "Today (t)", value: 0 },
        { name: "MTD (t)", value: 0 },
        { name: "Target (t)", value: 0 },
      ])
      setLineData(
        ["W1", "W2", "W3", "W4", "W5", "W6"].map((name) => ({ name, ton: 0 })),
      )
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  const fmtTon = (n) =>
    typeof n === "number"
      ? n.toLocaleString("id-ID", { maximumFractionDigits: 2 })
      : "0"

  const colors = getChartColors()

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-1">
          Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ringkasan operasional PalmTrack Cloud — data agregat dari API.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6" aria-label="Quick stats">
        <StatCard
          title="Total Contractors"
          value={loading ? "…" : String(contractorTotal)}
          hint="GET /api/vendors (count)"
        />
        <StatCard
          title="Total Blocks"
          value={loading ? "…" : String(blockTotal)}
          hint="GET /api/blocks (count)"
        />
        <StatCard
          title="Today's Hauling Tonnage"
          value={loading ? "…" : `${fmtTon(todayTonnage)} t`}
          hint="GET /api/dashboard → today.total_tonage"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6" aria-label="Charts">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 lg:p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Hauling Achievement Today</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Perbandingan hari ini, MTD, dan target tonase</p>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: colors.textColor, fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: colors.textColor, fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.tooltipBg,
                    border: `1px solid ${colors.tooltipBorder}`,
                    borderRadius: 8,
                    color: isDarkMode ? '#f3f4f6' : '#111827',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  cursor={{ fill: isDarkMode ? '#374151' : '#f3f4f6' }}
                />
                <Bar dataKey="value" fill={colors.barColor} radius={[4, 4, 0, 0]} name="Ton" maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 lg:p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Monthly Production Trend</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ilustrasi tren mingguan (derivasi dari ringkasan MTD)</p>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: colors.textColor, fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: colors.textColor, fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.tooltipBg,
                    border: `1px solid ${colors.tooltipBorder}`,
                    borderRadius: 8,
                    color: isDarkMode ? '#f3f4f6' : '#111827',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ton"
                  stroke={colors.barColor}
                  strokeWidth={3}
                  dot={{ fill: colors.tooltipBg, stroke: colors.barColor, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: colors.barColor }}
                  name="Ton (idx)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
