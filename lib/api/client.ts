const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://pharmaet-api.test/api/v1";
const SERVER_BASE_URL = API_BASE_URL.replace(/\/v1\/?$/, "");

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export interface ApiFetchOptions extends RequestInit {
  token?: string;
  useRawUrl?: boolean;
}

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token = getAuthToken(), useRawUrl = false, headers, ...customConfig } = options;

  const url = useRawUrl ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || "GET",
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "auth_token=; path=/; max-age=0";
      if (!window.location.pathname.startsWith("/auth/")) {
        window.location.href = "/auth/login";
      }
    }
    const errorData = await response.json().catch(() => ({ message: `HTTP Error ${response.status}` }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export { API_BASE_URL, SERVER_BASE_URL };
