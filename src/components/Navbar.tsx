"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { User } from "next-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <>
      <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white fixed w-full top-0 z-50">
        <div className="container mx-auto flex flex-col gap-1 md:gap-0 md:flex-row justify-between items-center">
          <Link href="/" className="text-xl font-bold mb-4 md:mb-0">
            True Feedback
          </Link>
          {session ? (
            <>
              <span className="mr-4 text-[16px] leading-6 hidden md:block">
                Welcome, {user.username || user.email}
              </span>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-24 md:w-auto  bg-slate-100 text-black"
                    variant="outline"
                  >
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure that you want to logout?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => signOut()}>
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Link href="/sign-in">
              <Button
                className="w-full md:w-auto bg-slate-100 text-black"
                variant={"outline"}
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
