"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useSession } from "next-auth/react";
import messages from "@/data/messages.json";
import { MessageSquareMore } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <main className="flex-grow flex flex-col items-center justify-center gap-8 px-4 md:px-24 pt-28 md:pt-20 bg-white text-gray-900">
        <section className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold">
            Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg">
            Where your identity remains a secret.
          </p>
        </section>
        <Carousel
          className="w-64 md:w-1/2"
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="min-h-40">
                    <CardHeader>
                      <CardTitle>{message.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                      <MessageSquareMore className="flex-shrink-0" />
                      <div>
                        <p>{message.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {message.received}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        {session && (
          <Link href="/dashboard">
            <Button className="">View Dashboard</Button>
          </Link>
        )}
      </main>
      <footer className="text-center p-4 md:p-6 bg-gray-900 text-white">
        © {dayjs().format("YYYY")} True-Feedback. All rights reserved.
      </footer>
    </>
  );
}
