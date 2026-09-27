import { toFollowResult } from "./follow-user";

describe("toFollowResult", () => {
  it("204 はフォローした", () => {
    expect(toFollowResult({ kind: "ok", status: 204, body: null })).toEqual({ kind: "followed" });
  });

  it("204 でない成功は契約と違うので throw する", () => {
    expect(() => toFollowResult({ kind: "ok", status: 200, body: {} })).toThrow();
  });

  it("業務の拒否は backend の文言のまま返す", () => {
    expect(
      toFollowResult({ kind: "rejected", message: "フォロー上限に達している利用者がフォローする" }),
    ).toEqual({ kind: "rejected", message: "フォロー上限に達している利用者がフォローする" });
  });

  it("利用上限は rate_limited", () => {
    expect(toFollowResult({ kind: "rate_limited" })).toEqual({ kind: "rate_limited" });
  });
});
