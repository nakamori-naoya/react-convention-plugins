import { Suspense, startTransition, use, useState } from "react";
import { ErrorBoundary } from "../ErrorBoundary";
import type { UserId } from "../user/user-id";
import { followUser } from "./follow-user";
import { findUsersToFollow, type UserToFollow } from "./users-to-follow";
import { UsersToFollowList } from "./UsersToFollowList";

/** フォローする相手を探す画面。一覧の読み取りを持ち、フォローの後はこの読み取りを読み直す。 */
export function FindUsersToFollowPage() {
  const [usersToFollow, setUsersToFollow] = useState(findUsersToFollow);

  async function follow(followeeId: UserId) {
    const result = await followUser(followeeId);
    if (result.kind === "followed" || result.kind === "outcome_unknown") {
      startTransition(() => setUsersToFollow(findUsersToFollow()));
    }
    return result;
  }

  return (
    <main>
      <h1>フォローする相手を探す</h1>
      <ErrorBoundary fallback={<p role="alert">一覧を読めませんでした。</p>}>
        <Suspense fallback={<p>一覧を読み込んでいます。</p>}>
          <UsersToFollowSection usersToFollow={usersToFollow} onFollow={follow} />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}

function UsersToFollowSection({
  usersToFollow,
  onFollow,
}: {
  usersToFollow: Promise<UserToFollow[]>;
  onFollow: (followeeId: UserId) => ReturnType<typeof followUser>;
}) {
  return <UsersToFollowList users={use(usersToFollow)} onFollow={onFollow} />;
}
