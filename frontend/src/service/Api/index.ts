export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ApiResponse<T = unknown> = { success: boolean; data?: T; message?: string };
const BASE_URL: string = import.meta.env?.VITE_API_BASE_URL || "";
function buildUrl(route: string, method: ApiMethod, payload?: unknown): string {
  const absolute = route.startsWith("http://") || route.startsWith("https://");
  let url = absolute ? route : BASE_URL ? (route.startsWith("/") ? `${BASE_URL}${route}` : `${BASE_URL}/${route}`) : route;
  if (method === "GET" && payload && typeof payload === "object" && !Array.isArray(payload)) {
    const params = new URLSearchParams();
    Object.entries(payload as Record<string, unknown>).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      params.append(k, String(v));
    });
    const qs = params.toString();
    if (qs) url += url.includes("?") ? `&${qs}` : `?${qs}`;
  }
  return url;
}
function extractMessage(obj: unknown): string | undefined {
  if (!obj) return undefined;
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") {
    const anyObj = obj as Record<string, unknown>;
    if (typeof anyObj.message === "string") return anyObj.message;
    if (typeof anyObj.error === "string") return anyObj.error;
    if (Array.isArray(anyObj.errors)) {
      const first = anyObj.errors[0] as unknown;
      if (typeof first === "string") return first;
      if (first && typeof (first as Record<string, unknown>).message === "string")
        return (first as Record<string, unknown>).message as string;
    }
    if (typeof anyObj.detail === "string") return anyObj.detail;
  }
  return undefined;
}
export async function apiRequest<T = unknown>(
  route: string,
  method: ApiMethod,
  payload?: unknown,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: BodyInit | undefined;
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  if (payload !== undefined && method !== "GET") {
    if (isFormData) {
      body = payload as FormData;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload);
    }
  }
  const url = buildUrl(route, method, payload);
  
  // Merge headers from init if provided
  const mergedHeaders = new Headers(headers);
  if (init?.headers) {
    const initHeaders = new Headers(init.headers);
    initHeaders.forEach((v, k) => mergedHeaders.set(k, v));
  }

  try {
    const res = await fetch(url, { ...init, method, headers: mergedHeaders, body });
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      parsed = undefined;
    }
    if (res.ok) {
      if (parsed && typeof parsed === "object" && "success" in parsed && "data" in parsed) {
        return parsed as ApiResponse<T>;
      }
      return { success: true, data: parsed as T };
    }
    if (res.status === 401) {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("token");
        // Only redirect to login if we're on a dashboard or protected page
        const path = window.location.pathname;
        if (path.startsWith("/dashboard") || path.startsWith("/settings")) {
          window.location.href = "/login";
        }
      }
    }
    const message = extractMessage(parsed) ?? res.statusText ?? "Request failed";
    return { success: false, message };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof (err as { message?: unknown })?.message === "string"
          ? ((err as { message?: unknown }).message as string)
          : "Network error";
    return { success: false, message };
  }
}
export default apiRequest;
