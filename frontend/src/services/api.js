const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
const TOKEN_STORAGE_KEY = "palmtrack_access_token"

// ==================== TOKEN MANAGEMENT ====================

let authToken = null

export function setToken(token) {
  authToken = token
}

export function getToken() {
  return authToken
}

/** Muat token dari localStorage ke memori (untuk header Authorization). */
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

// Helper: handle response errors
async function handleResponse(response) {
  if (response.status === 401) {
    clearToken()
    throw new Error("UNAUTHORIZED")
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    
    // Handle validation errors (array of error objects from Pydantic)
    if (Array.isArray(error.detail)) {
      const messages = error.detail
        .map(err => {
          if (typeof err === 'object' && err.msg) {
            return err.msg
          }
          return String(err)
        })
        .join("; ")
      throw new Error(messages || `Validation error (${response.status})`)
    }
    
    // Handle single error message
    if (typeof error.detail === 'string') {
      throw new Error(error.detail)
    }
    
    // Fallback
    throw new Error(`Request gagal (${response.status})`)
  }
  // 204 No Content
  if (response.status === 204) return null
  return response.json()
}

// ==================== AUTH API ====================

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
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(itemData),
  })
  return handleResponse(response)
}

export async function updateItem(id, itemData) {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    },
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

// ==================== VENDORS (CONTRACTORS) API ====================

/**
 * Daftar vendor / kontraktor (GET /api/vendors).
 * @returns {{ total: number, vendors: Array }}
 */
/**
 * Daftar blok (GET /api/blocks).
 * @returns {{ total: number, blocks: Array }}
 */
export async function fetchBlocks({ skip = 0, limit = 20, search = "", status = null } = {}) {
  const params = new URLSearchParams()
  params.append("skip", String(skip))
  params.append("limit", String(limit))
  if (search) params.append("search", search)
  if (status !== null && status !== undefined && status !== "") {
    params.append("status", String(status))
  }
  const response = await fetch(`${API_URL}/api/blocks?${params}`, {
    headers: { ...authHeaders() },
  })
  return handleResponse(response)
}

/** Ringkasan dashboard (GET /api/dashboard). */
export async function fetchDashboard() {
  const response = await fetch(`${API_URL}/api/dashboard`, {
    headers: { ...authHeaders() },
  })
  return handleResponse(response)
}

export async function fetchVendors({ skip = 0, limit = 20, search = "", status = null } = {}) {
  const params = new URLSearchParams()
  params.append("skip", String(skip))
  params.append("limit", String(limit))
  if (search) params.append("search", search)
  if (status !== null && status !== undefined && status !== "") {
    params.append("status", String(status))
  }

  const response = await fetch(`${API_URL}/api/vendors?${params}`, {
    headers: {
      ...authHeaders(),
    },
  })
  return handleResponse(response)
}

export async function createVendor(vendorData) {
  const response = await fetch(`${API_URL}/api/vendors`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(vendorData),
  })
  return handleResponse(response)
}

export async function updateVendor(id, vendorData) {
  const response = await fetch(`${API_URL}/api/vendors/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json"
    },
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

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`)
    const data = await response.json()
    return data.status === "healthy"
  } catch {
    return false
  }
}