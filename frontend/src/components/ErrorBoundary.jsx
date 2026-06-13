import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f8f9fa", margin: 0 }}>
          <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxWidth: "500px", width: "90%" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }} aria-hidden="true">🚨</div>
            <h2 style={{ color: "#e74c3c", marginTop: 0 }}>Oops, Terjadi Kesalahan Kritis!</h2>
            <p style={{ color: "#555", marginBottom: "24px", lineHeight: "1.5" }}>
              Maaf, antarmuka pengguna tidak dapat dirender karena kesalahan internal. Tim teknis akan segera memeriksanya.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px"
              }}
              aria-label="Muat Ulang Halaman"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
