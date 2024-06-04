"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Loader2, MoveLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyAccount() {
  const params = useParams<{ username: string }>();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const register = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/verify-code", {
        username: params.username,
        code: data.code,
      });
      toast({
        title: "Success",
        description: response.data.message,
      });
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error in verifing code:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Verification failed",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <Link href="/">
          <div className="absolute top-12 left-12 w-14 h-14 hidden lg:flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-300 duration-100 cursor-pointer">
            <MoveLeft size={32} />
          </div>
        </Link>
        <div className="w-full mx-2 sm:mx-0 max-w-xl p-8 space-y-8 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <h3 className="mb-3 text-gray-700">Hello {params.username}</h3>
            <h1 className="text-[2.5rem] leading-[2.75rem] font-extrabold tracking-tight mb-10">
              Verify Your Account
            </h1>
          </div>
          <Form {...register}>
            <form
              onSubmit={register.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={register.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <div className="w-full flex flex-col items-center gap-4">
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field} autoFocus>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Please enter the verification code sent to your email.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className="w-full flex justify-center">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
