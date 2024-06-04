"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { messageSchema } from "@/schemas/messageSchema";
import axios, { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import { useCompletion } from "ai/react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const parsedStringMessages = (messages: string): string[] => {
  return messages.split("||");
};

export default function MessagePage() {
  const params = useParams<{ username: string }>();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username: params.username,
        content: data.content,
      });
      console.log(response);
      toast({
        title: "Message Sent",
      });
      form.setValue("content", "");
    } catch (error) {
      console.error("Error in sending message:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to send the message.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialMessages =
    "What is your favourite food?||What do you think about current situation in tech industary?||What are your goals for next 5 years?";

  const {
    complete,
    completion,
    isLoading: isSuggestionsLoading,
    error: suggestionErrors,
  } = useCompletion({
    // api: "/api/suggest-messages-openai",
    api: "/api/suggest-messages-googleai",
    initialCompletion: initialMessages,
  });

  const fetchSuggestedMessages = async () => {
    try {
      complete("");
    } catch (error) {
      console.error("Error fetching suggestion messages:", error);
      toast({
        title: "Suggestions failed",
        description:
          suggestionErrors?.message || "Error in fetching suggestions.",
      });
    }
  };

  const messageContent = form.watch("content");

  const handleSuggestionMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  return (
    <>
      <div className="container my-8 p-6 bg-white rounded max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Public Profile Link
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Send Anonymous Message to @{params.username}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your message here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex justify-end sm:justify-center">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <div className="mx-3">Send</div>
                )}
              </Button>
            </div>
          </form>
        </Form>
        <div className="space-y-4 my-8">
          <div className="space-y-2">
            <Button
              onClick={fetchSuggestedMessages}
              disabled={isSuggestionsLoading}
              className="w-fit my-4"
            >
              Suggest Messages
            </Button>
            <p>Click on a message below to select it.</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Messages</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col w-full gap-4">
              {isSuggestionsLoading ? (
                <>
                  <Skeleton className="w-full h-10 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-lg" />
                  <Skeleton className="w-full h-10 rounded-lg" />
                </>
              ) : suggestionErrors ? (
                <p className="text-red-500">{suggestionErrors.message}</p>
              ) : (
                parsedStringMessages(completion).map((message, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-wrap"
                    onClick={() => handleSuggestionMessageClick(message)}
                  >
                    {message}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        <Separator className="my-8" />
        <div className="text-center">
          <div className="mb-4">Get Your Message Board</div>
          <Link href={"/sign-up"}>
            <Button>Create Your Account</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
