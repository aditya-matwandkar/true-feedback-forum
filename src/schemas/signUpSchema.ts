import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username should be at least 3 characters")
  .max(16, "Username should be no more than 16 characters")
  .regex(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,15}$/);

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});
