import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";

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

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
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
        messages: user[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(
      "Unexpected error while getting user's messages from server:",
      error
    );
    return Response.json(
      {
        success: false,
        message: "Unexpected error while getting user's messages from server",
      },
      { status: 500 }
    );
  }
}
