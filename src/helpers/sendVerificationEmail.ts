import { resend } from "@/lib/resendEmail";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  username: string,
  email: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const resendResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "True Feedback Forum | Verification code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.log("Error sending verification email:", error);
    return { success: false, message: "Failed to send verification email" };
  }
}
