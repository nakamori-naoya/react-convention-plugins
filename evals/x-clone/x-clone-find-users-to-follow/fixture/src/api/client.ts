import { getToken, redirectToLogin } from "../auth";

/** backend の API の base URL。例: "https://api.xclone.example.com"。 */
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

/** backend の応答のうち、画面のすることが変わる種類。 */
export type BackendResponse =
  | { kind: "ok"; status: number; body: unknown }
  | { kind: "rejected"; message: string }
  | { kind: "rate_limited" };

/**
 * backend を、いまの利用者のトークン付きで呼ぶ。トークンが無いか 401 ならログインの画面へ移して throw する。
 * 409 は業務の拒否として本文の message を、429 は利用上限として返し、それ以外の失敗は throw する。
 */
export async function callBackend(path: string, init: RequestInit = {}): Promise<BackendResponse> {
  const token = getToken();
  if (token === null) {
    redirectToLogin();
    throw new Error("ログインしていない");
  }
  const res = await fetch(apiBaseUrl + path, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (res.status === 401) {
    redirectToLogin();
    throw new Error("認証されていない");
  }
  if (res.status === 409) {
    const body: unknown = await res.json();
    if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") {
      return { kind: "rejected", message: body.message };
    }
    throw new Error("業務の拒否の本文が契約と違う");
  }
  if (res.status === 429) {
    return { kind: "rate_limited" };
  }
  if (!res.ok) {
    throw new Error(`backend が ${res.status} を返した`);
  }
  return { kind: "ok", status: res.status, body: res.status === 204 ? null : await res.json() };
}
