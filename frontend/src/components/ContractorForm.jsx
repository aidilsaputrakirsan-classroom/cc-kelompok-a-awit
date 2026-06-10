import { useState, useEffect, useRef } from "react"
import { UploadCloud } from "lucide-react"

function ContractorForm({ onSubmit, editingContractor, onCancel, loading }) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "",
    status: "active",
  })
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (editingContractor) {
      setFormData({
        code: editingContractor.code || "",
        name: editingContractor.name || "",
        type: editingContractor.type || "",
        status: editingContractor.status ? "active" : "inactive",
      })
      setFileName("")
    } else {
      setFormData({
        code: "",
        name: "",
        type: "",
        status: "active",
      })
      setFileName("")
    }
    setError("")
  }, [editingContractor])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : "")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.code.trim()) {
      setError("Kode kontraktor wajib diisi")
      return
    }
    if (!formData.name.trim()) {
      setError("Nama kontraktor wajib diisi")
      return
    }

    const contractorData = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      type: formData.type.trim() || null,
      status: formData.status === "active",
    }

    try {
      await onSubmit(contractorData, editingContractor?.id)
      setFormData({
        code: "",
        name: "",
        type: "",
        status: "active",
      })
      setFileName("")
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

      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center mb-3 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-sm">
          <UploadCloud size={20} />
        </div>
        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Contractor Logo</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {fileName || "Drag & drop atau klik untuk memilih file"}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contractor Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Contoh: IWA"
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
            disabled={loading || !!editingContractor}
            maxLength="10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contractor Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Contoh: PT. IWACO Jaya Abadi"
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
            disabled={loading}
            maxLength="100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contractor Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
            disabled={loading}
          >
            <option value="">Select Contractor Type...</option>
            <option value="Palm Oil Harvester">Palm Oil Harvester</option>
            <option value="Palm Oil Hauling">Palm Oil Hauling</option>
            <option value="Palm Oil Monitoring">Palm Oil Monitoring</option>
          </select>
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
            ) : editingContractor ? "Save Changes" : "Save"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ContractorForm
