import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

//Update the user preference of accepting messages
export async function POST(request: Request) {
  await dbConnect();

  //Get user data from the session
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  //Check if user is logged-in
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }

  const userId = user._id;
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessages: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user's preference to accept messages",
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User preference to accept messages updated successfully",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(
      "Failed to update user's preference to accept messages:",
      error
    );
    return Response.json(
      {
        success: false,
        message: "Failed to update user's preference to accept messages",
      },
      { status: 500 }
    );
  }
}

//Get the user preference of accepting messages
export async function GET(request: Request) {
  await dbConnect();

  //Get user data from the session
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  //Check if user is logged-in
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }

  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in getting message acceptence status:", error);
    return Response.json(
      {
        success: false,
        message: "Error in getting message acceptence status",
      },
      { status: 500 }
    );
  }
}
