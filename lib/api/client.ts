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
    let message = errorData.message || `Request failed with status ${response.status}`;
    if (errorData.errors && typeof errorData.errors === "object") {
      const firstErrorField = Object.keys(errorData.errors)[0];
      if (firstErrorField && Array.isArray(errorData.errors[firstErrorField]) && errorData.errors[firstErrorField][0]) {
        message = errorData.errors[firstErrorField][0];
      }
    }
    throw new Error(message);
  }

  return response.json();
}

export function extractListData<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && typeof res.data === "object" && Array.isArray(res.data.data)) {
    return res.data.data;
  }
  return [];
}

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export function extractPaginationMeta(res: any, fallbackLength: number = 0): PaginationMeta {
  if (!res) return { currentPage: 1, lastPage: 1, perPage: 15, total: fallbackLength };

  const obj = res && res.data && typeof res.data === "object" && !Array.isArray(res.data) ? res.data : res;

  if (obj && typeof obj === "object") {
    const currentPage = Number(obj.current_page ?? obj.currentPage ?? 1);
    const lastPage = Number(obj.last_page ?? obj.lastPage ?? 1);
    const perPage = Number(obj.per_page ?? obj.perPage ?? 15);
    const total = Number(obj.total ?? fallbackLength);

    return { currentPage, lastPage, perPage, total };
  }

  return { currentPage: 1, lastPage: 1, perPage: 15, total: fallbackLength };
}

export { API_BASE_URL, SERVER_BASE_URL };
