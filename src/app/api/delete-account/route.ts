import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  await dbConnect();

  // Get user data from the session
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  // Check if user is logged-in
  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  try {
    // Delete the user's account
    await UserModel.findByIdAndDelete(user._id);

    // Invalidate the session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Account Deleted Successfully",
      },
      { status: 200 }
    );

    response.cookies.set("next-auth.session-token", "", {
      expires: new Date(0),
      path: "/",
    });
    response.cookies.set("next-auth.csrf-token", "", {
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.log("Unexpected error while deleting the account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error while deleting the account.",
      },
      { status: 500 }
    );
  }
}
