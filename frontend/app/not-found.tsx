"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Compass, Home, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[90vh] items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[#7C3AED]/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[20rem] h-[20rem] bg-fuchsia-500/10 blur-[100px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md text-center space-y-8 relative z-10"
      >
        {/* Floating Icon */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mx-auto w-24 h-24 rounded-md bg-gradient-to-br from-[#7C3AED] to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-purple-500/20"
        >
          <Compass className="h-12 w-12 text-white" />
        </motion.div>

        <div className="space-y-2">
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-8xl md:text-9xl font-black tracking-tighter italic bg-gradient-to-b from-foreground via-foreground/80 to-[#7C3AED]/50 bg-clip-text text-transparent"
          >
            404
          </motion.p>
          <div className="flex items-center justify-center gap-2 text-[#7C3AED] font-black uppercase tracking-[0.3em] text-[10px]">
            <Sparkles className="h-3 w-3" />
            Signal Lost in Space
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight">
            Oops! Page Not Found
          </h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            The curriculum you&apos;re looking for has drifted into another
            dimension or never existed in this timeline.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            asChild
            size="lg"
            className="rounded-md h-14 px-8 bg-[#7C3AED] hover:bg-[#6D28D9] font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-md h-14 px-8 font-bold border-2 transition-all hover:bg-muted/50"
          >
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
