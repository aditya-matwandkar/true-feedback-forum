import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { User } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  await dbConnect();

  const messageId = params.messageId;

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

  try {
    const updatedMessages = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updatedMessages.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found / already deleted",
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Unexpected error while deleting messages:", error);
    return Response.json(
      {
        success: false,
        message: "Unexpected error while deleting messages.",
      },
      { status: 500 }
    );
  }
}
