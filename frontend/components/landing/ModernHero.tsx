"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BrainCircuit, Network, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Adaptive Curriculums",
    desc: "Your course path shape-shifts. AI analyzes your progress in real-time, instantly adjusting difficulty.",
    color: "from-purple-600 to-[#7C3AED]",
  },
  {
    icon: Zap,
    title: "Instant AI Mentorship",
    desc: "Stuck on a concept? Our built-in AI tutor is ready 24/7 with personalized explanations.",
    color: "from-amber-500 to-orange-400",
  },
  {
    icon: Network,
    title: "Neural Skill Graphing",
    desc: "Visualize expertise. See your skills mapped in a dynamic, neural-network dashboard.",
    color: "from-blue-500 to-cyan-400",
  },
];

export default function HomeSections() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="flex flex-col gap-10">
      {/* --- HERO SECTION --- */}
      <section className="relative container pt-24 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-400 text-sm font-bold tracking-wide">
              <Sparkles className="h-4 w-4" />
              NEXT-GEN AI LEARNING
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
              Master Skills <br />
              <span className="italic bg-gradient-to-r from-[#7C3AED] to-fuchsia-500 bg-clip-text text-transparent">
                Faster with AI
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              E-Study is an adaptive platform that evolves with you. Get custom
              curriculums designed by AI specifically for your goals.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] h-14 px-8 text-lg font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
              >
                <Link href="/courses">
                  Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-md h-14 px-8 text-lg font-bold border-2 transition-all hover:bg-muted/50"
              >
                <Link href="/courses">View Demo</Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero Image Container */}
          <motion.div
            style={{ y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-md overflow-hidden"
            >
              {/* Replace with your actual image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED] to-fuchsia-500 opacity-20 rounded-md" />
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80"
                alt="Team collaborating"
                className="h-full w-full object-cover rounded-md"
                width={500}
                height={400}
              />
            </motion.div>

            {/* Floating Card */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 p-6 rounded-md bg-background/90 backdrop-blur-xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-20 flex items-center gap-4"
            >
              <div className="h-14 w-14 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Zap className="h-7 w-7 fill-current" />
              </div>
              <div className="pr-4">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  Learning Speed
                </p>
                <p className="text-2xl font-black italic tracking-tighter text-foreground">
                  +140%{" "}
                  <span className="text-sm font-bold not-italic text-muted-foreground">
                    faster
                  </span>
                </p>
              </div>
            </motion.div>

            <div className="absolute -inset-4 bg-[#7C3AED]/20 blur-3xl -z-10 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* --- INTELLIGENCE SECTION --- */}
      <section className="container py-20">
        <div className="grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-4 lg:sticky lg:top-24 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
              Intelligence At <br /> Every Step.
            </h2>
            <div className="h-1.5 w-20 bg-[#7C3AED] rounded-full" />
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              We leverage neural models to predict where you will struggle,
              providing help before you even ask.
            </p>
          </div>

          <div className="md:col-span-8 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "group relative p-8 rounded-md border bg-card/50 backdrop-blur-sm transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2",
                  i === 2 && "sm:col-span-2",
                )}
              >
                <div
                  className={cn(
                    "h-14 w-14 rounded-md bg-gradient-to-br flex items-center justify-center mb-6 text-white shadow-lg",
                    feature.color,
                  )}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
