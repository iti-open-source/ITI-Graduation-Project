import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";

import Footer from "@/components/home_components/footer";
import CustomLayout from "@/layouts/custom-layout";

export default function Home({ features = [] }) {
  const props = usePage().props;

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const defaultFeatures = [
    {
      title: "Real-Time Coding",
      desc: "Collaborate live with an integrated editor designed for technical interviews.",
      icon: "💻",
    },
    {
      title: "Actionable Feedback",
      desc: "AI-powered analysis with detailed reports to help candidates improve faster.",
      icon: "📊",
    },
    {
      title: "Simulated Interviews",
      desc: "Practice with mock interview rooms that mirror real-world scenarios.",
      icon: "🎤",
    },
  ];

  return (
    <CustomLayout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <header className="h-screen bg-gradient-to-r from-slate-800 to-blue-500 text-white">
          <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
            <motion.h1
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mb-6 text-4xl leading-tight font-bold md:text-6xl"
            >
              Smarter Interview Rooms for Institutes & Professionals
            </motion.h1>
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mb-10 max-w-2xl text-lg text-slate-200 md:text-xl"
            >
              Host structured interviews, practice coding challenges, or join a discussion room
              tailored to your interests — all in one seamless platform.
            </motion.p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/lobby">Create a Room</Link>
              </Button>
              <Button variant="outline" className="text-[var(--color-text)]" size="lg" asChild>
                <Link href="/lobby">Join Random Room</Link>
              </Button>
            </div>
          </div>
        </header>
        {/* Features */}
        <section className="bg-card py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.h2
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-14 text-center text-3xl font-bold text-foreground md:text-4xl"
            >
              Why Choose Our Platform?
            </motion.h2>
            <div className="grid gap-8 md:grid-cols-3">
              {(features.length ? features : defaultFeatures).map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card className="h-full text-center transition hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-4 text-4xl">{f.icon}</div>
                      <CardTitle className="text-xl">{f.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{f.desc}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* How It Works */}
        <section className="bg-muted py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.h2
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-14 text-center text-3xl font-bold text-foreground md:text-4xl"
            >
              How It Works
            </motion.h2>
            <Card className="px-8 py-12 md:px-16">
              <div className="space-y-10">
                {[
                  {
                    step: "Schedule Interviews",
                    desc: "Organize structured interview sessions with customizable templates and flexible scheduling.",
                  },
                  {
                    step: "Collaborate in Real-Time",
                    desc: "Engage in coding sessions, whiteboard discussions, or structured Q&A within interactive rooms.",
                  },
                  {
                    step: "Get Actionable Insights",
                    desc: "Receive instant AI-powered feedback and performance analytics for continuous improvement.",
                  },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex items-start md:items-center"
                  >
                    <div className="mr-6 flex-shrink-0 text-2xl font-bold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground md:text-xl">
                        {step.step}
                      </h3>
                      <p className="mt-2 text-muted-foreground">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </CustomLayout>
  );
}
