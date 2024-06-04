"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/components/ui/use-toast";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MoveLeft } from "lucide-react";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [usernameResponse, setUsernameResponse] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const debounced = useDebounceCallback(setUsername, 500);

  //Zod implementation
  const register = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  //Check if username is available
  useEffect(() => {
    const checkUniqueUsername = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameResponse("");
        try {
          const response = await axios.get(
            `/api/check-unique-username?username=${username}`
          );
          setUsernameResponse(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameResponse(
            axiosError.response?.data.message ?? "Error checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUniqueUsername();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);
      const result = response.data;
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
      });
      router.replace(`/verify/${username}`);
    } catch (error) {
      console.error("Error in signing up user:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast({
        title: "Signup failed",
        description: errorMessage,
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
            <h1 className="text-[2.5rem] leading-[2.75rem] font-extrabold tracking-tight mb-6">
              Join True-Feedback
            </h1>
            <p className="mb-5">
              Ready for your anonymous journey? Sign up to begin!
            </p>
          </div>
          <Form {...register}>
            <form
              onSubmit={register.handleSubmit(onSubmit)}
              className="space-y-6 relative"
            >
              <FormField
                control={register.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="user_123"
                        spellCheck={false}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          debounced(e.target.value);
                        }}
                      />
                    </FormControl>
                    {isCheckingUsername && (
                      <Loader2 className="animate-spin absolute right-0" />
                    )}
                    <p
                      className={`text-sm absolute right-0 ${
                        usernameResponse === "Username is available"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {username && usernameResponse}{" "}
                    </p>
                    <FormMessage className="absolute right-0" />
                  </FormItem>
                )}
              />
              <FormField
                control={register.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="user@example.com"
                        spellCheck={false}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="absolute right-0" />
                  </FormItem>
                )}
              />
              <FormField
                control={register.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="password"
                        spellCheck={false}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="absolute right-0" />
                  </FormItem>
                )}
              />
              <div className="flex justify-center pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <div className="text-center mt-4">
            <div>
              Already a member?{" "}
              <Link
                href={"/sign-in"}
                className="text-blue-600 hover:text-blue-800"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
