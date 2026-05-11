"use client";

import { motion } from "framer-motion";
import {
  Github,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";
import Link from "next/link";

const footerLinks = {
  platform: [
    { name: "Browse Courses", href: "/courses" },
    { name: "Mentors", href: "/instructors" },
    { name: "Pricing", href: "#" },
    { name: "Resources", href: "#" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Partner Program", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#" },
  { icon: Github, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Instagram, href: "#" },
];

export function SiteFooter() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  return (
    <footer className="border-t bg-background/50 pt-16 pb-8">
      <motion.div
        className="container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Logo & Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="group flex items-center gap-3 w-fit">
              <motion.div
                whileHover={{ rotate: -12, scale: 1.1 }}
                className="flex h-10 w-10 items-center justify-center rounded bg-[#7C3AED] shadow-lg shadow-purple-500/30"
              >
                <GraduationCap className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-2xl font-black tracking-tighter italic bg-gradient-to-br from-foreground via-foreground to-[#7C3AED] bg-clip-text text-transparent">
                E-Study
              </span>
            </Link>
            <p className="max-w-[240px] text-sm text-muted-foreground leading-relaxed">
              Empowering learners globally with industry-leading courses and
              expert mentorship.
            </p>
            <div className="flex gap-4 mt-2">
              {socialLinks.map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="text-muted-foreground hover:text-[#7C3AED] transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Dynamic Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold uppercase tracking-wider">
                Platform
              </h4>
              <nav className="flex flex-col gap-2">
                {footerLinks.platform.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#7C3AED] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold uppercase tracking-wider">
                Company
              </h4>
              <nav className="flex flex-col gap-2">
                {footerLinks.company.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#7C3AED] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-4 col-span-2 sm:col-span-1">
              <h4 className="text-sm font-bold uppercase tracking-wider">
                Newsletter
              </h4>
              <p className="text-xs text-muted-foreground">
                Subscribe to get the latest updates.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-md border bg-muted/50 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                />
                <button className="rounded-md bg-[#7C3AED] px-3 py-2 text-white hover:bg-purple-700 transition-colors">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row md:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} E-Study Inc. Crafted By{" "}
            <span className="text-sm font-semibold text-purple-700">
              Anisha Zahan
            </span>{" "}
            for modern learners.
          </p>
          <nav className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </motion.div>
    </footer>
  );
}
