import { apiFetch, SERVER_BASE_URL } from "./client";

export interface ApiHealthResponse {
  status: string;
  time: string;
}

export async function checkApiHealth(): Promise<ApiHealthResponse> {
  const pingUrl = `${SERVER_BASE_URL}/ping`;
  return apiFetch<ApiHealthResponse>(pingUrl, { useRawUrl: true });
}
