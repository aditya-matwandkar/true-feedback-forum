import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifySchema } from "@/schemas/verifySchema";

const VerifyCodeSchema = z.object({
  code: verifySchema,
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    const decodedUsername = decodeURIComponent(username);

    const codeParam = {
      code: {
        code,
      },
    };

    //Validation using zod
    const result = VerifyCodeSchema.safeParse(codeParam);

    if (!result.success) {
      //   const verifyCodeErrors = result.error.format().verifyCode?._errors || [];
      return Response.json(
        {
          success: false,
          message: "Invalid verification code",
        },
        { status: 400 }
      );
    }

    const { code: verifyCode } = result.data.code;

    //Check if user exists with given username
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }

    if (user.isVerified) {
      return Response.json(
        {
          success: false,
          message: "User is already verified",
        },
        { status: 400 }
      );
    }

    const isCodeValid = user.verifyCode === verifyCode;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "User verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code has expired, please sign up again",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect verification code",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("Error verifying user:", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying user",
      },
      { status: 500 }
    );
  }
}
