/** 認証サービスが発行した、いまの利用者のトークンを返す。ログインしていなければ null。 */
export function getToken(): string | null {
  return sessionStorage.getItem("auth_token");
}

/** ログインの画面へ移す。 */
export function redirectToLogin(): void {
  window.location.assign("/login");
}
