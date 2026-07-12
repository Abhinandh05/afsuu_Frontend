/**
 * API helpers for the AI Business OS frontend.
 * Base URL comes from NEXT_PUBLIC_API_URL (see .env.local.example).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, { status = 0, code = "api_error" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Call a backend endpoint with a JWT.
 * Expects the backend's standard { success, data, message, error } shape.
 *
 * @param {string} endpoint - e.g. "/api/v1/agents/research"
 * @param {object|null} payload - request body (ignored for GET)
 * @param {string} token - JWT access token
 * @param {string} [method="POST"]
 * @returns {Promise<object>} data field from a successful response
 */
export async function runAgent(endpoint, payload, token, method = "POST") {
  let response;
  const upper = (method || "POST").toUpperCase();
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const init = { method: upper, headers };
    if (upper !== "GET" && upper !== "HEAD") {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(payload ?? {});
    }
    response = await fetch(`${API_BASE}${endpoint}`, init);
  } catch {
    throw new ApiError("Unable to reach the server. Is the backend running?", {
      status: 0,
      code: "network_error",
    });
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.status === 401) {
    throw new ApiError("Your session has expired. Please log in again.", {
      status: 401,
      code: "unauthorized",
    });
  }

  if (body && body.success === false) {
    throw new ApiError(body.error || body.message || "Request failed", {
      status: response.status,
      code: "agent_error",
    });
  }

  if (!response.ok) {
    const detail =
      (body && (body.error || body.detail || body.message)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(
      typeof detail === "string" ? detail : JSON.stringify(detail),
      { status: response.status, code: "http_error" }
    );
  }

  if (body && body.success === true) {
    return body.data;
  }

  // Fallback if a route returns raw data without the wrapper
  return body;
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export { API_BASE };
