import { useCallback, useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { fetchVendors } from "../services/api"
import ContractorTable from "../components/ContractorTable"
import ContractorPagination from "../components/ContractorPagination"
import "./MasterDataContractorPage.css"

/**
 * Master Data Contractor — data dari GET /api/vendors (Contractors).
 */
function MasterDataContractorPage({ onUnauthorized: onUnauthorizedProp, onNotify: onNotifyProp }) {
  const outlet = useOutletContext()
  const onUnauthorized = onUnauthorizedProp ?? outlet?.onUnauthorized
  const onNotify = onNotifyProp ?? outlet?.showToast
  const [contractors, setContractors] = useState([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState("")
  const [searchDraft, setSearchDraft] = useState("")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchVendors({ skip, limit, search: search.trim() || undefined })
      setContractors(data.vendors || [])
      setTotal(typeof data.total === "number" ? data.total : 0)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        onUnauthorized?.()
      } else {
        onNotify?.(err.message || "Gagal memuat kontraktor", "error")
        setContractors([])
        setTotal(0)
      }
    } finally {
      setLoading(false)
    }
  }, [skip, limit, search, onUnauthorized, onNotify])

  useEffect(() => {
    load()
  }, [load])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSkip(0)
    setSearch(searchDraft)
  }

  const handlePageChange = (page) => {
    if (page < 1) return
    if (total === 0) return
    const maxPage = Math.max(1, Math.ceil(total / limit))
    if (page > maxPage) return
    setSkip((page - 1) * limit)
  }

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
    setSkip(0)
  }

  return (
    <div className="mdc-page">
      <div className="mdc-page__toolbar">
        <div className="mdc-page__titles">
          <h1>Master Data Contractor</h1>
          <p>
            PalmTrack Cloud — kelola data kontraktor / vendor transport. Data diambil dari endpoint
            {" "}
            <code style={{ fontSize: "0.8em" }}>/api/vendors</code>.
          </p>
        </div>
        <div className="mdc-page__actions">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="search"
              className="mdc-search"
              placeholder="Cari code / nama…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              aria-label="Cari kontraktor"
            />
          </form>
          <button
            type="button"
            className="mdc-btn-add"
            onClick={() => onNotify?.("Form tambah kontraktor: hubungkan ke POST /api/vendors bila siap.", "info")}
          >
            + Add New
          </button>
        </div>
      </div>

      <ContractorTable contractors={contractors} loading={loading} />

      <ContractorPagination
        total={total}
        skip={skip}
        limit={limit}
        disabled={loading}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  )
}

export default MasterDataContractorPage
