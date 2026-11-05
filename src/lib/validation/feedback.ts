import { z } from "zod";

export const feedbackSchema = z.object({
  type: z.enum(["feedback", "question", "review"]),
  message: z.string().trim().min(5, "Say a bit more — at least 5 characters.").max(2000),
});
