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
import "./Dashboard.css"

function StatCard({ title, value, hint }) {
  return (
    <div className="pt-dash-card">
      <h3 className="pt-dash-card__head">{title}</h3>
      <p className="pt-dash-card__value">{value}</p>
      {hint && <p className="pt-dash-card__hint">{hint}</p>}
    </div>
  )
}

function Dashboard() {
  const { showToast } = useOutletContext() || {}
  const isDarkMode = useDarkMode()
  const [loading, setLoading] = useState(true)
  const [serviceError, setServiceError] = useState(false)
  const [contractorTotal, setContractorTotal] = useState(0)
  const [blockTotal, setBlockTotal] = useState(0)
  const [todayTonnage, setTodayTonnage] = useState(0)
  const [barData, setBarData] = useState([])
  const [lineData, setLineData] = useState([])

  // Get CSS variables for chart styling
  const getChartColors = () => {
    const root = document.documentElement
    const style = getComputedStyle(root)
    return {
      textColor: style.getPropertyValue('--text-secondary').trim(),
      gridColor: style.getPropertyValue('--border-color').trim(),
      barColor: style.getPropertyValue('--accent-primary').trim(),
      tooltipBg: style.getPropertyValue('--bg-card').trim(),
      tooltipBorder: style.getPropertyValue('--border-color').trim(),
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    setServiceError(false)
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
      if (err.message === "SERVICE_UNAVAILABLE" || err.message === "Failed to fetch") {
        setServiceError(true)
        showToast?.("Sebagian layanan sedang tidak tersedia (503)", "error")
      } else if (err.message !== "UNAUTHORIZED") {
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
    <div className="pt-dash">
      <div className="pt-dash__intro">
        <h2 className="pt-dash__title">Dashboard</h2>
        <p className="pt-dash__sub">
          Ringkasan operasional PalmTrack Cloud — data agregat dari API.
        </p>
      </div>

      {serviceError && (
        <div style={{ padding: "15px 20px", backgroundColor: "#fff3cd", color: "#856404", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>🚧 <strong>Layanan Terganggu:</strong> Beberapa data mungkin tidak dapat ditampilkan karena gangguan koneksi ke microservice.</span>
          <button onClick={load} style={{ padding: "6px 12px", backgroundColor: "#ffc107", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Coba Lagi</button>
        </div>
      )}

      <section className="pt-dash__stats" aria-label="Quick stats">
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

      <section className="pt-dash__charts" aria-label="Charts">
        <div className="pt-dash-chart">
          <h3 className="pt-dash-chart__head">Hauling Achievement Today</h3>
          <p className="pt-dash-chart__sub">Perbandingan hari ini, MTD, dan target tonase</p>
          <div className="pt-dash-chart__frame">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} />
                <XAxis dataKey="name" tick={{ fill: colors.textColor, fontSize: 12 }} />
                <YAxis tick={{ fill: colors.textColor, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.tooltipBg,
                    border: `1px solid ${colors.tooltipBorder}`,
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="value" fill={colors.barColor} radius={[6, 6, 0, 0]} name="Ton" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-dash-chart">
          <h3 className="pt-dash-chart__head">Monthly Production Trend</h3>
          <p className="pt-dash-chart__sub">Ilustrasi tren mingguan (derivasi dari ringkasan MTD)</p>
          <div className="pt-dash-chart__frame">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} />
                <XAxis dataKey="name" tick={{ fill: colors.textColor, fontSize: 12 }} />
                <YAxis tick={{ fill: colors.textColor, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.tooltipBg,
                    border: `1px solid ${colors.tooltipBorder}`,
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ton"
                  stroke={colors.barColor}
                  strokeWidth={2.5}
                  dot={{ fill: colors.barColor, r: 4 }}
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
