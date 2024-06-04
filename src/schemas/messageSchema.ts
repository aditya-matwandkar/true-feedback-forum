import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(8, { message: "Message must be atleast of 8 characters" })
    .max(450, { message: "Message should not be more than 450 characters" }),
});
