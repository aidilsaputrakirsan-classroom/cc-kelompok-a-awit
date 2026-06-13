import { Navigate, Route, Routes } from "react-router-dom"
import "./App.css"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import LoginPage from "./components/LoginPage"
import MainLayout from "./layouts/MainLayout"
import { LoginGate } from "./routes/LoginGate"
import { ProtectedRoute } from "./routes/ProtectedRoute"
import Dashboard from "./pages/Dashboard"
import MasterDataContractorPage from "./pages/MasterDataContractorPage"
import BlocksPage from "./pages/BlocksPage"
import MappingPage from "./pages/MappingPage"
import ActualHauling from "./pages/ActualHauling"
import ItemsPage from "./pages/ItemsPage"
import AboutPage from "./components/AboutPage"
import StatusPage from "./pages/StatusPage"

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={(
              <LoginGate>
                <LoginPage />
              </LoginGate>
            )}
          />
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="master-data/contractors" element={<MasterDataContractorPage />} />
              <Route path="master-data/blocks" element={<BlocksPage />} />
              <Route path="master-data/mapping" element={<MappingPage />} />
              <Route path="transactions/hauling" element={<ActualHauling />} />
              <Route path="items" element={<ItemsPage />} />
              <Route path="status" element={<StatusPage />} />
              <Route path="about" element={<AboutPage onBack={() => window.history.back()} />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
