import { z } from "zod";

/** 登録した利用者を一人に決める識別子。例: "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f01"。 */
export const userIdSchema = z.uuid().brand<"UserId">();

export type UserId = z.infer<typeof userIdSchema>;
