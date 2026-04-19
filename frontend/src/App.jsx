import { Navigate, Route, Routes } from "react-router-dom"
import "./App.css"
import { AuthProvider } from "./context/AuthContext"
import LoginPage from "./components/LoginPage"
import MainLayout from "./layouts/MainLayout"
import { LoginGate } from "./routes/LoginGate"
import { ProtectedRoute } from "./routes/ProtectedRoute"
import Dashboard from "./pages/Dashboard"
import MasterDataContractorPage from "./pages/MasterDataContractorPage"
import BlocksPage from "./pages/BlocksPage"
import HaulingPage from "./pages/HaulingPage"
import ItemsPage from "./pages/ItemsPage"

export default function App() {
  return (
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
            <Route path="transactions/hauling" element={<HaulingPage />} />
            <Route path="items" element={<ItemsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
