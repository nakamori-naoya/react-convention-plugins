import { z } from "zod";
import { getToken } from "../auth";
import { userIdSchema, type UserId } from "../user/user-id";

/** 一覧を見ている利用者から見た、一覧の一人の区別。本人、フォロー中、フォローしていない、のどれか一つに決まる。 */
export type Relation = string;

/** フォローする相手を探す一覧の一人。 */
export type UserToFollow = { userId: UserId; relation: Relation };

const usersToFollowSchema = z.object({
  users: z.array(
    z.object({
      user_id: userIdSchema,
      relation: z.string(),
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
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/users/to-follow`, {
    headers: { Authorization: `Bearer ${getToken() ?? ""}` },
  });
  return parseUsersToFollow(await res.json());
}
