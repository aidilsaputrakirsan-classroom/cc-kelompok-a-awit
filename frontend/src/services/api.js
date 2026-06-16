// VITE_API_URL dari CD workflow = "https://domain/api"
// DeployCC nginx strip prefix /api/ sebelum forward ke uvicorn.
// Sehingga:
//   fetch(`${API_URL}/auth/login`)  → GET /api/auth/login → uvicorn: /auth/login  ✅
//   fetch(`${API_URL}/api/items`)   → GET /api/api/items  → uvicorn: /api/items   ✅
//
// Dev lokal: Jika menggunakan Vite proxy, biarkan kosong. Jika menggunakan gateway Nginx (port 80) langsung, gunakan VITE_API_URL="http://localhost"
export const API_URL = (import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "http://localhost").replace(/\/$/, "")

const TOKEN_STORAGE_KEY = "palmtrack_access_token"

// ==================== TOKEN MANAGEMENT ====================

let authToken = null

export function setToken(token) {
  authToken = token
}

export function getToken() {
  return authToken
}

export function syncTokenFromStorage() {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) {
      authToken = stored
      return true
    }
  } catch {
    /* ignore */
  }
  authToken = null
  return false
}

export function clearToken() {
  authToken = null
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function authHeaders() {
  const headers = {}
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }
  return headers
}

async function handleResponse(response) {
  if (response.status === 401) {
    clearToken()
    throw new Error("UNAUTHORIZED")
  }
  if (response.status >= 502 && response.status <= 504) {
    throw new Error("SERVICE_UNAVAILABLE")
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    if (Array.isArray(error.detail)) {
      const messages = error.detail
        .map(err => (typeof err === 'object' && err.msg ? err.msg : String(err)))
        .join("; ")
      throw new Error(messages || `Validation error (${response.status})`)
    }
    if (typeof error.detail === 'string') {
      throw new Error(error.detail)
    }
    if (typeof error.message === 'string') {
      throw new Error(error.message)
    }
    throw new Error(`Request gagal (${response.status})`)
  }
  if (response.status === 204) return null
  return response.json()
}

// ==================== AUTH API ====================
// Backend routes: /auth/register, /auth/login, /auth/me

export async function register(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
  return handleResponse(response)
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const data = await handleResponse(response)
  setToken(data.access_token)
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token)
  } catch {
    /* ignore */
  }
  return data
}

export async function getMe() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

// ==================== ITEMS API ====================
// Backend routes: /items (Microservices API Gateway)

export async function fetchItems(search = "", skip = 0, limit = 20) {
  const params = new URLSearchParams()
  if (search) params.append("search", search)
  params.append("skip", skip)
  params.append("limit", limit)

  const response = await fetch(`${API_URL}/items?${params}`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function createItem(itemData) {
  const response = await fetch(`${API_URL}/items`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(itemData),
  })
  return handleResponse(response)
}

export async function updateItem(id, itemData) {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(itemData),
  })
  return handleResponse(response)
}

export async function deleteItem(id) {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

// ==================== VENDORS API ====================
// Backend routes: /api/vendors

export async function fetchVendors({ skip = 0, limit = 20, search = "", status = null } = {}) {
  const params = new URLSearchParams()
  params.append("skip", String(skip))
  params.append("limit", String(limit))
  if (search) params.append("search", search)
  if (status !== null && status !== undefined && status !== "") {
    params.append("status", String(status))
  }
  const response = await fetch(`${API_URL}/api/vendors?${params}`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function createVendor(vendorData) {
  const response = await fetch(`${API_URL}/api/vendors`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(vendorData),
  })
  return handleResponse(response)
}

export async function updateVendor(id, vendorData) {
  const response = await fetch(`${API_URL}/api/vendors/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(vendorData),
  })
  return handleResponse(response)
}

export async function deleteVendor(id) {
  const response = await fetch(`${API_URL}/api/vendors/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

// ==================== BLOCKS API ====================
// Backend routes: /api/blocks

export async function fetchBlocks({ skip = 0, limit = 20, search = "", status = null } = {}) {
  const params = new URLSearchParams()
  params.append("skip", String(skip))
  params.append("limit", String(limit))
  if (search) params.append("search", search)
  if (status !== null && status !== undefined && status !== "") {
    params.append("status", String(status))
  }
  const response = await fetch(`${API_URL}/api/blocks?${params}`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function createBlock(blockData) {
  const response = await fetch(`${API_URL}/api/blocks`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(blockData),
  })
  return handleResponse(response)
}

export async function updateBlock(id, blockData) {
  const response = await fetch(`${API_URL}/api/blocks/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(blockData),
  })
  return handleResponse(response)
}

export async function deleteBlock(id) {
  const response = await fetch(`${API_URL}/api/blocks/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

// ==================== DASHBOARD API ====================

export async function fetchDashboard() {
  const response = await fetch(`${API_URL}/api/dashboard`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

// ==================== HEALTH ====================

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`)
    const data = await response.json()
    return data.status === "healthy"
  } catch {
    return false
  }
}