"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
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
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  //Zod implementation
  const register = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    const response = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });
    if (response?.error) {
      toast({
        title: "Login Failed",
        description:
          response?.error.substring("Error: ".length) ||
          "Incorrect username or password",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
    if (response?.url) {
      toast({
        title: "Login Successful",
      });
      setIsSubmitting(false);
      router.replace(`/dashboard`);
    }
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-center bg-gray-100 relative">
        <Link href="/">
          <div className="absolute top-12 left-12 w-14 h-14 hidden lg:flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-300 duration-100 cursor-pointer">
            <MoveLeft size={32} />
          </div>
        </Link>
        <div className="w-full mx-2 sm:mx-0 max-w-xl p-8 space-y-8 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <h1 className="text-[2.5rem] leading-[2.75rem] font-extrabold tracking-tight mb-6">
              True-Feedback
            </h1>
            <p className="mb-5">Sign in to begin!</p>
          </div>
          <Form {...register}>
            <form
              onSubmit={register.handleSubmit(onSubmit)}
              className="space-y-6 relative"
            >
              <FormField
                control={register.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email/Username</FormLabel>
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
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <div className="text-center mt-4">
            <div>
              {"Don't have an account? "}
              <Link
                href={"/sign-up"}
                className="text-blue-600 hover:text-blue-800"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
