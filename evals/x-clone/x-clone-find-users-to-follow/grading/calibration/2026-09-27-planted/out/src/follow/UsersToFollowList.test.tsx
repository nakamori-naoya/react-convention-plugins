import { render, screen, within } from "@testing-library/react";
import type { UserId } from "../user/user-id";
import type { UserToFollow } from "./users-to-follow";
import { UsersToFollowList } from "./UsersToFollowList";

vi.mock("./FollowButton", () => ({ FollowButton: () => <button type="button">フォローする</button> }));

// BDD-018: U-0002 が見ている一覧
const users: UserToFollow[] = [
  { userId: "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f01" as UserId, relation: "following" },
  { userId: "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f02" as UserId, relation: "self" },
  { userId: "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f03" as UserId, relation: "not_following" },
  { userId: "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f04" as UserId, relation: "following" },
];

describe("UsersToFollowList", () => {
  it("受け取った順のまま、利用者IDと見ている人から見た区別を見せる", () => {
    render(<UsersToFollowList users={users} onFollow={vi.fn()} />);

    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f01フォロー中"),
      expect.stringContaining("0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f02本人"),
      expect.stringContaining("0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f03フォローしていない"),
      expect.stringContaining("0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f04フォロー中"),
    ]);
  });

  it("フォローする操作は、フォローしていない相手にだけ置く", () => {
    render(<UsersToFollowList users={users} onFollow={vi.fn()} />);

    const [following, self, notFollowing] = screen.getAllByRole("listitem");
    expect(within(following!).queryByRole("button")).not.toBeInTheDocument();
    expect(within(self!).queryByRole("button")).not.toBeInTheDocument();
    expect(within(notFollowing!).getByRole("button", { name: "フォローする" })).toBeInTheDocument();
  });
});
