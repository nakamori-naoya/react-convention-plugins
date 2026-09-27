import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserId } from "../user/user-id";
import type { FollowResult } from "./follow-user";
import { FollowButton } from "./FollowButton";

const followeeId = "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f03" as UserId;

function renderWithResult(result: FollowResult) {
  const onFollow = vi.fn(async (_followeeId: UserId) => result);
  render(<FollowButton followeeId={followeeId} onFollow={onFollow} />);
  return onFollow;
}

describe("FollowButton", () => {
  it("押すと、その相手の利用者IDでフォローする", async () => {
    const onFollow = renderWithResult({ kind: "followed" });

    await userEvent.click(screen.getByRole("button", { name: "フォローする" }));

    expect(onFollow).toHaveBeenCalledWith(followeeId);
  });

  it("業務の拒否は backend の文言をそのまま見せる", async () => {
    renderWithResult({ kind: "rejected", message: "フォロー上限に達している利用者がフォローする" });

    await userEvent.click(screen.getByRole("button", { name: "フォローする" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("フォロー上限に達している利用者がフォローする");
  });

  it("利用上限なら時間を置くよう伝える", async () => {
    renderWithResult({ kind: "rate_limited" });

    await userEvent.click(screen.getByRole("button", { name: "フォローする" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("しばらく時間を置いてから");
  });

  it("結果が分からないときは、もう一度の操作を促さず、読み直したことを伝える", async () => {
    renderWithResult({ kind: "outcome_unknown" });

    await userEvent.click(screen.getByRole("button", { name: "フォローする" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("一覧を読み直しました");
    expect(status).not.toHaveTextContent("もう一度");
  });

  it("送信中は押せない", async () => {
    let settle: (result: FollowResult) => void = () => {};
    render(
      <FollowButton
        followeeId={followeeId}
        onFollow={() => new Promise<FollowResult>((resolve) => (settle = resolve))}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "フォローする" }));

    expect(screen.getByRole("button", { name: "フォローする" })).toBeDisabled();
    settle({ kind: "followed" });
    expect(await screen.findByRole("button", { name: "フォローする" })).toBeEnabled();
  });
});
