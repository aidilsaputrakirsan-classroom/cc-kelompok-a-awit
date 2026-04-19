import "./PlaceholderPage.css"

function HaulingPage() {
  return (
    <div className="pt-placeholder">
      <h2>Actual Hauling</h2>
      <p>
        Modul transaksi hauling aktual. Gunakan endpoint{" "}
        <code>GET /api/hauling-transactions</code> untuk daftar dan pencatatan TBS.
      </p>
    </div>
  )
}

export default HaulingPage
