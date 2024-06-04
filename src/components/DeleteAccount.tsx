"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function DeleteAccount() {
  const { toast } = useToast();
  const [isDeleteUsernameCorrect, setIsDeleteUsernameCorrect] = useState(false);
  const { data: session } = useSession();

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete<ApiResponse>("/api/delete-account");
      toast({
        title: "Account Deleted Successfully",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.log(error);
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Your Account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Your Account</AlertDialogTitle>
            <AlertDialogDescription>
              {`To confirm, type "${session?.user.username}" in the box below`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleDeleteAccount}>
            <div className="py-5">
              <Input
                id="deleteUsername"
                name="deleteUsername"
                autoFocus
                autoComplete="off"
                onChange={(e) => {
                  const value = e.target.value;
                  setIsDeleteUsernameCorrect(value === session?.user.username);
                }}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setIsDeleteUsernameCorrect(false)}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                className="bg-red-600 hover:bg-red-500"
                disabled={!isDeleteUsernameCorrect}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
