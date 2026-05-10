import Link from "next/link";
import { ArrowRight, BrainCircuit, Sparkles, Zap, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeaturedSections } from "@/components/public/featured-sections";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 overflow-hidden blur-3xl pointer-events-none opacity-50 dark:opacity-30">
        <div className="mx-auto w-[60rem] h-[40rem] bg-gradient-to-tr from-primary/40 via-purple-500/20 to-blue-500/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-pulse" />
      </div>

      <section className="relative container pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="mx-auto max-w-4xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Next-Gen AI Learning Hub</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-primary/80">
            Supercharge Your Mind <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">With AI-Powered Courses</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            EDUCART learns how you learn. Experience personalized curriculums, real-time AI mentoring, and dynamic content that adapts to your unique pace and goals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
              <Link href="/courses">
                Explore AI Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base backdrop-blur-sm bg-background/50 border-primary/20 hover:bg-primary/10 transition-all duration-300">
              <Link href="/register">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative container pb-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Intelligence at Every Step</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Our platform integrates cutting-edge AI to provide an unparalleled learning experience.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BrainCircuit,
              title: "Adaptive Curriculums",
              desc: "Courses dynamically adjust their difficulty based on your real-time performance and understanding."
            },
            {
              icon: Zap,
              title: "Instant AI Mentorship",
              desc: "Get unblocked instantly with an AI tutor ready to explain complex concepts 24/7."
            },
            {
              icon: Network,
              title: "Skill Graphing",
              desc: "Visualize your growing expertise in a neural-network-like dashboard connecting related skills."
            }
          ].map((feature, i) => (
            <Card key={i} className="group relative overflow-hidden bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base mt-2">{feature.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <FeaturedSections />
    </div>
  );
}
