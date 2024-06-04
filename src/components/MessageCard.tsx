"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Message } from "@/model/User";
import dayjs from "dayjs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );
      toast({
        title: response.data.message,
      });
      onMessageDelete(message._id as string);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="card-bordered">
        <CardHeader>
          <div className="flex justify-between gap-3">
            <CardTitle className="text-lg font-medium text-wrap">
              {message.content}
            </CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this message.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-500"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="text-sm pt-2 flex justify-between items-end">
            <p>{dayjs(message.createdAt).format("h:mm A")}</p>
            <p>{dayjs(message.createdAt).format("MMM D, YYYY")}</p>
          </div>
        </CardHeader>
      </Card>
    </>
  );
}
