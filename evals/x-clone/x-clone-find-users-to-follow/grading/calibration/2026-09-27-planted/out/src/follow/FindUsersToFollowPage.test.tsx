import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { apiBaseUrl } from "../api/client";
import { FindUsersToFollowPage } from "./FindUsersToFollowPage";

// backend は別の配備単位なので、api.md の契約の要求と応答で差し替える。
const self = "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f01";
const followee = "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f03";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => sessionStorage.setItem("auth_token", "token-of-self"));
afterEach(() => sessionStorage.clear());

function usersToFollow(followeeRelation: "following" | "not_following") {
  return HttpResponse.json({
    users: [
      { user_id: self, relation: "self" },
      { user_id: followee, relation: followeeRelation },
    ],
    next_cursor: null,
  });
}

// 一覧の読み取りを待つ間の描画を、act の中で終えさせる
async function renderPage() {
  await act(async () => {
    render(<FindUsersToFollowPage />);
  });
}

describe("FindUsersToFollowPage", () => {
  it("フォローすると、トークンの利用者として相手を送り、一覧を読み直してフォロー中を見せる", async () => {
    let followed = false;
    const followRequests: { authorization: string | null; body: unknown }[] = [];
    server.use(
      http.get(`${apiBaseUrl}/users/to-follow`, () => usersToFollow(followed ? "following" : "not_following")),
      http.post(`${apiBaseUrl}/follows`, async ({ request }) => {
        followRequests.push({ authorization: request.headers.get("Authorization"), body: await request.json() });
        followed = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderPage();

    await userEvent.click(await screen.findByRole("button", { name: "フォローする" }));

    expect(await screen.findByText("フォロー中")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "フォローする" })).not.toBeInTheDocument();
    expect(followRequests).toEqual([{ authorization: "Bearer token-of-self", body: { followee_id: followee } }]);
  });

  it("業務の拒否は 409 の文言をそのまま見せる", async () => {
    server.use(
      http.get(`${apiBaseUrl}/users/to-follow`, () => usersToFollow("not_following")),
      http.post(`${apiBaseUrl}/follows`, () =>
        HttpResponse.json({ message: "フォロー上限に達している利用者がフォローする" }, { status: 409 }),
      ),
    );
    await renderPage();

    await userEvent.click(await screen.findByRole("button", { name: "フォローする" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("フォロー上限に達している利用者がフォローする");
  });

  it("送った後に接続が切れたら、一覧を読み直して今の区別を見せる", async () => {
    let reads = 0;
    server.use(
      http.get(`${apiBaseUrl}/users/to-follow`, () => {
        reads += 1;
        // 接続が切れる前に backend でフォローが成立していた場面
        return usersToFollow(reads === 1 ? "not_following" : "following");
      }),
      http.post(`${apiBaseUrl}/follows`, () => HttpResponse.error()),
    );
    await renderPage();

    await userEvent.click(await screen.findByRole("button", { name: "フォローする" }));

    const items = await screen.findAllByRole("listitem");
    expect(await within(items[1]!).findByText("フォロー中")).toBeInTheDocument();
    expect(reads).toBe(2);
  });

  it("契約と違う一覧の応答は、一覧の区画の失敗として見せる", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    server.use(
      http.get(`${apiBaseUrl}/users/to-follow`, () =>
        HttpResponse.json({ users: [{ user_id: self, relation: "blocked" }], next_cursor: null }),
      ),
    );
    await renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("一覧を読めませんでした");
    expect(screen.getByRole("heading", { name: "フォローする相手を探す" })).toBeInTheDocument();
  });
});
