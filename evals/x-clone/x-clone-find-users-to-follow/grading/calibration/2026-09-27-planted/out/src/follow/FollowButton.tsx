import { useActionState } from "react";
import type { UserId } from "../user/user-id";
import type { FollowResult } from "./follow-user";

type Props = {
  followeeId: UserId;
  onFollow: (followeeId: UserId) => Promise<FollowResult>;
};

/** 一覧の一人をフォローする操作と、その結果の知らせ。 */
export function FollowButton({ followeeId, onFollow }: Props) {
  const [result, follow, isPending] = useActionState<FollowResult | null>(() => onFollow(followeeId), null);

  return (
    <form action={follow}>
      <button type="submit" disabled={isPending}>
        フォローする
      </button>
      {result !== null && <FollowResultNotice result={result} />}
    </form>
  );
}

function FollowResultNotice({ result }: { result: FollowResult }) {
  switch (result.kind) {
    case "followed":
      return null;
    case "rejected":
      return <p role="alert">{result.message}</p>;
    case "rate_limited":
      return <p role="alert">操作が続いたため受け付けられませんでした。しばらく時間を置いてから操作してください。</p>;
    case "outcome_unknown":
      return <p role="status">フォローできたかを確かめられなかったため、一覧を読み直しました。</p>;
    default: {
      const unknown: never = result;
      throw new Error(`未知のフォローの結果: ${JSON.stringify(unknown)}`);
    }
  }
}
