import { useState, useEffect } from "react"
import { fetchVendors } from "../services/api"

function BlockForm({ onSubmit, editingBlock, onCancel, loading }) {
  const [formData, setFormData] = useState({
    block_code: "",
    division: "",
    hectarage: "",
    status: "active",
    vendor_id: "",
  })
  const [error, setError] = useState("")
  const [vendors, setVendors] = useState([])
  const [loadingVendors, setLoadingVendors] = useState(false)

  useEffect(() => {
    const fetchFilteredVendors = async () => {
      setLoadingVendors(true)
      try {
        const data = await fetchVendors({ limit: 1000 })
        const filtered = (data.vendors || []).filter(
          (v) => v.type === "Palm Oil Harvester"
        )
        setVendors(filtered)
      } catch (err) {
        console.error("Failed to fetch vendors:", err)
        setVendors([])
      } finally {
        setLoadingVendors(false)
      }
    }
    fetchFilteredVendors()
  }, [])

  useEffect(() => {
    if (editingBlock) {
      setFormData({
        block_code: editingBlock.block_code || "",
        division: editingBlock.division || "",
        hectarage: editingBlock.hectarage ? String(editingBlock.hectarage) : "",
        status: editingBlock.status ? "active" : "inactive",
        vendor_id: editingBlock.vendor_id || "",
      })
    } else {
      setFormData({
        block_code: "",
        division: "",
        hectarage: "",
        status: "active",
        vendor_id: "",
      })
    }
    setError("")
  }, [editingBlock])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.block_code.trim()) {
      setError("Block Code wajib diisi")
      return
    }
    if (!formData.division.trim()) {
      setError("Division wajib diisi")
      return
    }
    if (!formData.hectarage || parseFloat(formData.hectarage) <= 0) {
      setError("Area Size harus lebih dari 0")
      return
    }

    const blockData = {
      block_code: formData.block_code.trim(),
      division: formData.division.trim(),
      hectarage: parseFloat(formData.hectarage),
      status: formData.status === "active",
      vendor_id: formData.vendor_id || null,
    }

    try {
      await onSubmit(blockData, editingBlock?.id)
      setFormData({
        block_code: "",
        division: "",
        hectarage: "",
        status: "active",
        vendor_id: "",
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Block Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="block_code"
              value={formData.block_code}
              onChange={handleChange}
              placeholder="Contoh: BLK-A1"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
              disabled={loading || !!editingBlock}
              maxLength="10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Division / Area Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="division"
              value={formData.division}
              onChange={handleChange}
              placeholder="Contoh: Afdeling 1"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Area Size (Ha) <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="hectarage"
              value={formData.hectarage}
              onChange={handleChange}
              placeholder="Contoh: 50.25"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
              disabled={loading}
              step="0.01"
              min="0"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Responsible Contractor</label>
            <select
              name="vendor_id"
              value={formData.vendor_id}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
              disabled={loading || loadingVendors}
            >
              <option value="">Select Contractor...</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
            disabled={loading}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50" 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[100px]" 
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : editingBlock ? "Save Changes" : "Save"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BlockForm
