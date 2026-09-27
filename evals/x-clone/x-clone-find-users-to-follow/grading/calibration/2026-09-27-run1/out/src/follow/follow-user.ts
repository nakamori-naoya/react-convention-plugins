import { callBackend, type BackendResponse } from "../api/client";
import type { UserId } from "../user/user-id";

/**
 * フォローするの結果のうち、画面のすることが変わる種類。
 * outcome_unknown は送った後に接続が切れ、フォローが成立したかが分からない状態である。
 */
export type FollowResult =
  | { kind: "followed" }
  | { kind: "rejected"; message: string }
  | { kind: "rate_limited" }
  | { kind: "outcome_unknown" };

/** backend の応答を、フォローするの結果へ写す。契約と違う成功は throw する。 */
export function toFollowResult(response: BackendResponse): FollowResult {
  switch (response.kind) {
    case "ok":
      if (response.status !== 204) {
        throw new Error(`フォローの成功が 204 でなく ${response.status} だった`);
      }
      return { kind: "followed" };
    case "rejected":
      return { kind: "rejected", message: response.message };
    case "rate_limited":
      return { kind: "rate_limited" };
    default: {
      const unknown: never = response;
      throw new Error(`未知の応答: ${JSON.stringify(unknown)}`);
    }
  }
}

/** いまの利用者が、相手をフォローする。 */
export async function followUser(followeeId: UserId): Promise<FollowResult> {
  let response: BackendResponse;
  try {
    response = await callBackend("/follows", {
      method: "POST",
      body: JSON.stringify({ followee_id: followeeId }),
    });
  } catch (error) {
    // fetch は接続が切れたときだけ TypeError で失敗する
    if (error instanceof TypeError) {
      return { kind: "outcome_unknown" };
    }
    throw error;
  }
  return toFollowResult(response);
}
