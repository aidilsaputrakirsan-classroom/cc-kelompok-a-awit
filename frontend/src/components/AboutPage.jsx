function AboutPage({ onBack }) {
  const team = [
    { name: "Adam Ibnu Ramadhan", nim: "10231003", role: "Lead Backend" },
    { name: "Alfian Fadillah Putra", nim: "10231009", role: "Lead Frontend" },
    { name: "Varrel Kaleb Ropard Pasaribu", nim: "10231089", role: "Lead DevOps" },
    { name: "Adonia Azarya Tamalonggehe", nim: "10231007", role: "Lead QA & Docs" },
    { name: "Adhyasta Firdaus", nim: "10231005", role: "Lead Backend" },
  ]

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={onBack} style={{ marginBottom: "20px" }}>
        ← Kembali
      </button>
      <h1>About This Project</h1>
      <p>Aplikasi Cloud-Native yang dibangun untuk mata kuliah Komputasi Awan.</p>
      
      <h2>Tech Stack</h2>
      <ul>
        <li><strong>Backend:</strong> FastAPI + PostgreSQL</li>
        <li><strong>Frontend:</strong> React + Vite</li>
        <li><strong>Container:</strong> Docker + Docker Compose</li>
        <li><strong>CI/CD:</strong> GitHub Actions (coming soon)</li>
      </ul>

      <h2>Tim</h2>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr><th>Nama</th><th>NIM</th><th>Peran</th></tr>
        </thead>
        <tbody>
          {team.map((m, i) => (
            <tr key={i}><td>{m.name}</td><td>{m.nim}</td><td>{m.role}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AboutPage