"use client";

import { ROUTES } from "@/lib/constants";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Globe,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stats = [
  { label: "Active Students", value: "50k+", icon: Users },
  { label: "Expert Instructors", value: "1.2k+", icon: Award },
  { label: "Premium Courses", value: "450+", icon: BookOpen },
  { label: "Global Partners", value: "25+", icon: Globe },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-10">
        <div className="container">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
              </span>
              Our Story
            </motion.div>

            <motion.h1
              {...fadeIn}
              className="mt-6 text-4xl font-black tracking-tight sm:text-6xl"
            >
              Redefining Education in the <br />
              <span className="italic bg-gradient-to-r from-[#7C3AED] to-purple-400 bg-clip-text text-transparent">
                Digital Era
              </span>
            </motion.h1>

            <motion.p
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground leading-relaxed"
            >
              Founded in 2024, E-Study began with a simple mission: to bridge
              the gap between world-class expertise and ambitious learners
              everywhere. We believe that quality education shouldn't be gated
              by geography or circumstance.
            </motion.p>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="container">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-md border bg-card p-6 transition-colors hover:border-[#7C3AED]/50"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white transition-all">
                <stat.icon className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">
                {stat.value}
              </h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Content Section: Mission & Vision */}
      <section className="container grid gap-12 md:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-square rounded-md overflow-hidden"
        >
          {/* Replace with your actual image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED] to-fuchsia-500 opacity-20" />
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80"
            alt="Team collaborating"
            className="h-full w-full object-cover"
            width={500}
            height={500}
          />
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Why Choose E-Study?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We don't just provide video lessons. We provide a comprehensive
              ecosystem designed for actual skill acquisition. Our platform
              integrates AI-driven learning paths with real-world projects.
            </p>
          </motion.div>

          <ul className="space-y-4">
            {[
              "Curated content from industry veterans",
              "Interactive coding environments and labs",
              "Recognized certifications upon completion",
              "Lifetime access to course updates",
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-sm font-medium"
              >
                <CheckCircle2 className="h-5 w-5 text-[#7C3AED]" />
                {item}
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-md bg-[#7C3AED] px-8 py-4 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
            >
              Explore Our Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-md bg-foreground p-12 text-center text-background dark:bg-muted dark:text-foreground overflow-hidden relative"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-bold md:text-5xl tracking-tighter">
              Ready to start your journey?
            </h2>
            <p className="mx-auto mt-4 max-w-lg opacity-80 mb-8">
              Join thousands of students who are already transforming their
              careers through structured, high-impact learning.
            </p>
            <Link
              href={ROUTES.REGISTER}
              className=" rounded-md  bg-white px-8 py-3 text-sm font-bold text-black hover:bg-white/90 transition-colors"
            >
              Join for Free
            </Link>
          </div>
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-[#7C3AED] blur-[120px] opacity-30" />
        </motion.div>
      </section>
    </div>
  );
}
