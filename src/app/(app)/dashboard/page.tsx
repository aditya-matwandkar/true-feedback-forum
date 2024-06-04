"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Message } from "@/model/User";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw } from "lucide-react";
import { MessageCard } from "@/components/MessageCard";
import Link from "next/link";
import DeleteAccount from "@/components/DeleteAccount";

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();

  const { data: session } = useSession();

  const { register, watch, setValue } = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessages = useCallback(async () => {
    //Fetch the user preference to accept the messages
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ||
          "Failed to fetch 'Accept messages' settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      //Fetch all the messages
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        setMessages(response.data.messages || []);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();
    fetchAcceptMessages();
  }, [setValue, session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    //Handle switch change (user preference to accept messages)
    try {
      const response = await axios.post("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast({
        title: `Accept Messages ${!acceptMessages ? "ON" : "OFF"}`,
        description: !acceptMessages
          ? "You will receive anonymous messages."
          : "You will not receive anonymous messages.",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Update failed",
        description:
          axiosError.response?.data.message ||
          "Failed to update 'Accept messages' settings",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  //Create a public URL for sending messages.
  const username = session?.user?.username;
  const baseURL =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
  const profileURL = `${baseURL}/u/${username}`;
  // const profileURL = `${window.location.origin}/u/${username}`;

  //Copy to clipboard functionality
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileURL);
    toast({
      title: "Copied",
    });
  };

  if (!session || !session.user) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-2xl font-semibold text-gray-800">
        <p>
          Please{" "}
          <Link href="/sign-in" className="text-blue-700">
            Login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full py-28 md:py-20 flex flex-col items-center lg:block">
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
          <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

          <div className="mb-8 sm:mb-4">
            <h2 className="text-lg font-semibold mb-2">
              Copy Your Unique Link
            </h2>{" "}
            <div className="flex items-center flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="text"
                value={profileURL}
                disabled
                className="input input-bordered w-full p-2 mr-2"
              />
              <Button onClick={copyToClipboard}>Copy</Button>
            </div>
          </div>

          <div className="mb-4 flex items-center">
            <Switch
              {...register("acceptMessages")}
              checked={acceptMessages}
              onCheckedChange={handleSwitchChange}
              // disabled={isSwitchLoading}
            />
            <span className="ml-2">
              Accept Messages: {acceptMessages ? "On" : "Off"}
            </span>
          </div>
          <Separator />

          <Button
            className="mt-4"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <MessageCard
                  key={message._id as string}
                  message={message}
                  onMessageDelete={handleDeleteMessage}
                />
              ))
            ) : (
              <p>No messages to display.</p>
            )}
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center">
          <div className="mb-4">Want to delete your account?</div>
          <DeleteAccount />
        </div>
      </div>
    </>
  );
}
