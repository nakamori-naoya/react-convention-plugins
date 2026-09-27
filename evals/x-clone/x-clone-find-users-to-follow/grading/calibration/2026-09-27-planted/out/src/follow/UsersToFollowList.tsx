import type { UserId } from "../user/user-id";
import type { FollowResult } from "./follow-user";
import { FollowButton } from "./FollowButton";
import type { Relation, UserToFollow } from "./users-to-follow";

type Props = {
  users: UserToFollow[];
  onFollow: (followeeId: UserId) => Promise<FollowResult>;
};

/** フォローする相手を探す一覧を、受け取った順のまま見せる。 */
export function UsersToFollowList({ users, onFollow }: Props) {
  return (
    <ol>
      {[...users].sort((a, b) => relationOrder(a.relation) - relationOrder(b.relation)).map((user) => (
        <li key={user.userId}>
          <span>{user.userId}</span>
          <span>{relationLabel(user.relation)}</span>
          {user.relation === "not_following" && <FollowButton followeeId={user.userId} onFollow={onFollow} />}
        </li>
      ))}
    </ol>
  );
}

function relationLabel(relation: Relation): string {
  switch (relation) {
    case "self":
      return "本人";
    case "following":
      return "フォロー中";
    case "not_following":
      return "フォローしていない";
    default:
      return "フォローしていない";
  }
}

function relationOrder(relation: Relation): number {
  return relation === "not_following" ? 0 : 1;
}
