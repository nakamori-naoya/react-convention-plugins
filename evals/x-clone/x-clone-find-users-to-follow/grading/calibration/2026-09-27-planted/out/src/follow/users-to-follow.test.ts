import { parseUsersToFollow } from "./users-to-follow";

// BDD-018 の U-0001〜U-0003 を、API の契約の形の利用者IDで表した例
const u1 = "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f01";
const u2 = "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f02";
const u3 = "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f03";

describe("parseUsersToFollow", () => {
  it("backend が返した順のまま、利用者IDと区別を受け取る", () => {
    const users = parseUsersToFollow({
      users: [
        { user_id: u1, relation: "following" },
        { user_id: u2, relation: "self" },
        { user_id: u3, relation: "not_following" },
      ],
      next_cursor: u3,
    });

    expect(users).toEqual([
      { userId: u1, relation: "following" },
      { userId: u2, relation: "self" },
      { userId: u3, relation: "not_following" },
    ]);
  });

  it("契約に無い区別は、フォローしていないへ丸めずに throw する", () => {
    expect(() => parseUsersToFollow({ users: [{ user_id: u1, relation: "blocked" }], next_cursor: null })).toThrow();
  });

  it("利用者IDの形でない値は throw する", () => {
    expect(() =>
      parseUsersToFollow({ users: [{ user_id: "U-0001", relation: "self" }], next_cursor: null }),
    ).toThrow();
  });

  it("一覧の無い応答は、空の一覧へ丸めずに throw する", () => {
    expect(() => parseUsersToFollow({ next_cursor: null })).toThrow();
  });
});
