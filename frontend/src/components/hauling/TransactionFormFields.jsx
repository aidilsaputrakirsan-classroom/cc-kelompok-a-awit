import React from "react";

function TransactionFormFields({ formData, onFormChange, vendors, blocks, submitting, netWeight }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "vehicle_plate") {
      onFormChange({ ...formData, [name]: value.toUpperCase() });
      return;
    }
    onFormChange({ ...formData, [name]: value });
  };

  const isNetWeightWarning = netWeight !== null && netWeight <= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ticket No <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="ticket_no"
          value={formData.ticket_no || ""}
          onChange={handleChange}
          placeholder="e.g. TKT-YYYYMMDD-001"
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
          disabled={submitting}
          maxLength={100}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">Maksimal 100 karakter</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Vendor <span className="text-red-500">*</span></label>
          <select
            name="vendor_id"
            value={formData.vendor_id || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
            disabled={submitting}
          >
            <option value="">Pilih vendor…</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.code})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Block / Area <span className="text-red-500">*</span></label>
          <select
            name="block_id"
            value={formData.block_id || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
            disabled={submitting}
          >
            <option value="">Pilih blok…</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.block_code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Vehicle Plate <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="vehicle_plate"
            value={formData.vehicle_plate || ""}
            onChange={handleChange}
            placeholder="Contoh: KT 1234 AB"
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50 uppercase"
            disabled={submitting}
            maxLength={20}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tanggal Transaksi <span className="text-red-500">*</span></label>
          <input
            type="date"
            name="transaction_date"
            value={formData.transaction_date || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
            disabled={submitting}
            max={new Date().toISOString().split("T")[0]} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weight In (ton) <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="weight_in"
            value={formData.weight_in !== undefined ? formData.weight_in : ""}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
            disabled={submitting}
            min={0}
            max={9999.999}
            step={0.001}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weight Out (ton) <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="weight_out"
            value={formData.weight_out !== undefined ? formData.weight_out : ""}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50"
            disabled={submitting}
            min={0}
            max={9999.999}
            step={0.001}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Net Weight (ton)</label>
        <div
          className={`w-full px-3 py-2 rounded-md text-lg font-bold border-2 border-dashed ${
            isNetWeightWarning 
              ? "bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-700" 
              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-500 dark:border-emerald-800"
          }`}
        >
          {netWeight === null ? "—" : netWeight.toFixed(3)}
        </div>
        {isNetWeightWarning && (
          <span className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
            ⚠️ Periksa kembali berat timbang
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Catatan</label>
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-gray-50 min-h-[80px] resize-y"
          disabled={submitting}
          maxLength={500}
          placeholder="Catatan opsional..."
        />
      </div>
    </div>
  );
}

export default TransactionFormFields;
