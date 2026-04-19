/**
 * Avatar inisial kontraktor (API belum menyediakan URL logo).
 */
function initialsFromContractor(contractor) {
  const code = (contractor.code || "").trim()
  const name = (contractor.name || "").trim()
  if (code.length >= 2) return code.slice(0, 2).toUpperCase()
  if (name.length >= 2) return name.slice(0, 2).toUpperCase()
  return "?"
}

function ContractorLogoCell({ contractor }) {
  const initials = initialsFromContractor(contractor)
  const hue = ((contractor.code || "").charCodeAt(0) || 65) % 360

  return (
    <div
      className="mdc-logo-cell"
      style={{
        background: `linear-gradient(135deg, hsla(${hue}, 42%, 42%, 0.95) 0%, hsla(${(hue + 40) % 360}, 38%, 32%, 0.98) 100%)`,
      }}
      aria-hidden="true"
    >
      <span className="mdc-logo-cell__text">{initials}</span>
    </div>
  )
}

export default ContractorLogoCell
