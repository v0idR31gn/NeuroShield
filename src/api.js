const API_BASE = import.meta.env.VITE_API_BASE || ""

let authToken = null
let onAuthChange = null

export function setAuthToken(token) {
  authToken = token
  if (token) {
    localStorage.setItem("neuroshield_token", token)
  } else {
    localStorage.removeItem("neuroshield_token")
  }
}

export function getAuthToken() {
  if (authToken) return authToken
  const stored = localStorage.getItem("neuroshield_token")
  if (stored) {
    authToken = stored
    return stored
  }
  return null
}

export function clearAuth() {
  authToken = null
  localStorage.removeItem("neuroshield_token")
  if (onAuthChange) onAuthChange(false)
}

export function onAuthStateChange(callback) {
  onAuthChange = callback
}

async function request(path, options = {}) {
  const token = getAuthToken()
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  })

  if (res.status === 401) {
    clearAuth()
    throw new Error("Authentication required")
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  authRegister: (data) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  authLogin: (data) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  authMe: () => request("/api/auth/me"),
  authLogout: () => request("/api/auth/logout", { method: "POST" }),

  health: () => request("/api/health"),

  // Analysis (feature 1 + 3)
  analyze: (input, output = "", options = {}) =>
    request("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ input, output, ...options }),
    }),
  analysisList: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/analysis${qs ? "?" + qs : ""}`)
  },
  analysisGet: (id) => request(`/api/analysis/${id}`),
  analysisDelete: (id) =>
    request(`/api/analysis/${id}`, { method: "DELETE" }),

  // Threats (now DB-backed)
  threats: () => request("/api/threats"),
  recentThreats: (limit = 4) => request(`/api/threats/recent?limit=${limit}`),

  // Metrics & analytics (feature 4 — real DB data)
  metrics: () => request("/api/metrics"),
  riskChart: () => request("/api/risk-chart"),
  riskDistribution: () => request("/api/risk-distribution"),
  mitigationRate: () => request("/api/mitigation-rate"),
  securityPosture: () => request("/api/security-posture"),

  // Security policies (feature 2)
  policies: () => request("/api/policies"),
  policyCreate: (data) =>
    request("/api/policies", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  policyUpdate: (id, data) =>
    request(`/api/policies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  policyDelete: (id) =>
    request(`/api/policies/${id}`, { method: "DELETE" }),

  responseActions: () => request("/api/response-actions"),
  reports: () => request("/api/reports"),
  generateReport: (data) =>
    request("/api/reports/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Automated Remediation
  remediationRecommendations: () => request("/api/remediation/recommendations"),
  applyRemediation: (id) =>
    request(`/api/remediation/${id}/apply`, {
      method: "POST",
    }),
  retestRemediation: (id) =>
    request(`/api/remediation/${id}/retest`, {
      method: "POST",
    }),

  // Audit logs (feature 7 — admin only)
  auditLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/audit-logs${qs ? "?" + qs : ""}`)
  },

  // Settings
  settingsWorkspaceGet: () => request("/api/settings/workspace"),
  settingsWorkspacePut: (data) =>
    request("/api/settings/workspace", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  settingsTeamGet: () => request("/api/settings/team-members"),
  settingsTeamPost: (data) =>
    request("/api/settings/team-members", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  settingsTeamDelete: (id) =>
    request(`/api/settings/team-members/${id}`, { method: "DELETE" }),
  settingsKeysGet: () => request("/api/settings/api-keys"),
  settingsKeysPost: (data) =>
    request("/api/settings/api-keys", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  settingsKeysDelete: (id) =>
    request(`/api/settings/api-keys/${id}`, { method: "DELETE" }),
  settingsKeysToggle: (id) =>
    request(`/api/settings/api-keys/${id}/toggle`, { method: "PATCH" }),
  settingsNotificationsGet: () => request("/api/settings/notifications"),
  settingsNotificationsPut: (data) =>
    request("/api/settings/notifications", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  settingsPrivacyGet: () => request("/api/settings/data-privacy"),
  settingsPrivacyPut: (data) =>
    request("/api/settings/data-privacy", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  settingsBillingGet: () => request("/api/settings/billing"),
  settingsBillingPlan: (plan) =>
    request("/api/settings/billing/plan", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),
}
