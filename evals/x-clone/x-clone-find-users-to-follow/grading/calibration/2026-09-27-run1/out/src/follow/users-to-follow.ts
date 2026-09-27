import { z } from "zod";
import { callBackend } from "../api/client";
import { userIdSchema, type UserId } from "../user/user-id";

/** 一覧を見ている利用者から見た、一覧の一人の区別。本人、フォロー中、フォローしていない、のどれか一つに決まる。 */
export type Relation = "self" | "following" | "not_following";

/** フォローする相手を探す一覧の一人。 */
export type UserToFollow = { userId: UserId; relation: Relation };

const usersToFollowSchema = z.object({
  users: z.array(
    z.object({
      user_id: userIdSchema,
      relation: z.enum(["self", "following", "not_following"]),
    }),
  ),
});

/** backend の一覧の応答を、並びを変えずに受け取る。契約と違えば throw する。 */
export function parseUsersToFollow(body: unknown): UserToFollow[] {
  return usersToFollowSchema
    .parse(body)
    .users.map((user) => ({ userId: user.user_id, relation: user.relation }));
}

/** いまの利用者が、フォローする相手を探す一覧の最初の部分を読む。 */
export async function findUsersToFollow(): Promise<UserToFollow[]> {
  const response = await callBackend("/users/to-follow");
  if (response.kind !== "ok") {
    throw new Error(`一覧の読み取りが ${response.kind} で終わった`);
  }
  return parseUsersToFollow(response.body);
}
