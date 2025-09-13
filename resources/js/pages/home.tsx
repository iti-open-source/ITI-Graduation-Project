import About from "@/components/home_components/about";
import Features from "@/components/home_components/features";
import Footer from "@/components/home_components/footer";
import Hero from "@/components/home_components/hero";
import Services from "@/components/home_components/services";
import Works from "@/components/home_components/works";
import { Button } from "@/components/ui/button";
import CustomLayout from "@/layouts/custom-layout";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";

export default function Home() {
  const { auth } = usePage().props as { auth?: { user?: { role: string } } };
  const userRole = auth?.user?.role;
  let getStartedLink: string | null = null;

  if (!auth?.user) {
    getStartedLink = "/login";
  } else if (["admin", "instructor", "student"].includes(userRole || "")) {
    getStartedLink = "/dashboard";
  } else if (userRole === null) {
    getStartedLink = null;
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <CustomLayout>
      <div className="min-h-screen overflow-y-hidden bg-background text-foreground">
        {/* Hero */}
        <Hero />

        {/*About Us */}
        <About />

        {/* Services */}
        <Services />

        {/* Features */}
        <Features />

        {/* Stats */}
        {/* <section className="py-16 
          bg-gradient-to-r from-blue-100 to-indigo-200 text-slate-800 
          dark:from-indigo-700 dark:to-blue-600 dark:text-white">
          <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {[
              { number: "5K+", label: "Interviews Hosted" },
              { number: "10K+", label: "Active Users" },
              { number: "95%", label: "Positive Feedback" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="text-4xl font-extrabold">{stat.number}</h3>
                <p className="mt-2 text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section> */}

        {/* How It Works */}
        <Works />

        {/* Testimonials */}
        {/* <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.h2
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-14 text-center text-3xl font-bold md:text-4xl"
            >
              What Our Users Say
            </motion.h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  name: "Sarah L.",
                  feedback: "This platform helped me ace my interviews with confidence. The AI feedback is 🔥",
                },
                {
                  name: "James K.",
                  feedback: "As a recruiter, I love how structured and smooth the interview process is now.",
                },
                {
                  name: "Emily R.",
                  feedback: "MockMate is a game-changer. The coding rooms feel just like real interviews!",
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card className="h-full p-6 transition hover:shadow-xl hover:scale-105">
                    <CardContent>
                      <p className="italic">“{t.feedback}”</p>
                      <p className="mt-4 font-semibold text-primary">— {t.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA */}
        <section className="relative bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-100 py-16 text-center dark:from-slate-900 dark:via-blue-900 dark:to-indigo-800">
          <div className="mx-auto max-w-4xl">
            <motion.h2
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl font-bold md:text-4xl"
            >
              Ready to level up your interview skills?
            </motion.h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of candidates and recruiters who trust MockMate.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              {getStartedLink && (
                <Button asChild size="lg" className="shadow-lg transition hover:scale-105">
                  <Link href={getStartedLink}>Get Started</Link>
                </Button>
              )}
              {/* <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:scale-105 transition"
              >
                <Link href="/lobby">Try a Demo</Link>
              </Button> */}
            </div>
          </div>
        </section>

        {/* Pricing */}
        {/* <Pricing /> */}

        {/* Contact */}
        <section id="contact" className="relative overflow-hidden py-28 text-center">
          <div className="absolute inset-0 -z-10">
            <div className="gradient-mesh absolute -top-1/4 -left-1/4 h-[140%] w-[140%]"></div>
          </div>

          <motion.div
            className="relative z-10 mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/60 p-10 px-6 shadow-lg backdrop-blur-md dark:border-slate-700/40 dark:bg-slate-900/40"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="mb-6 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl">
              Let’s Connect!
            </h2>
            <p className="mb-12 text-lg text-slate-700 sm:text-xl dark:text-slate-300">
              Have a question or just want to say hi? We’d love to hear from you.
            </p>

            <a
              href="mailto:support@mockmate.com"
              className="animate-float inline-block rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-10 py-4 font-semibold text-white shadow-xl transition hover:from-blue-700 hover:to-sky-600 hover:shadow-blue-400/40"
            >
              📩 support@mockmate.com
            </a>
          </motion.div>

          <style>{`
    .gradient-mesh {
      background: radial-gradient(
          circle at 20% 20%,
          rgba(59, 130, 246, 0.4),
          transparent 50%
        ),
        radial-gradient(
          circle at 80% 30%,
          rgba(14, 165, 233, 0.4),
          transparent 50%
        ),
        radial-gradient(
          circle at 50% 80%,
          rgba(6, 182, 212, 0.4),
          transparent 50%
        );
      filter: blur(100px);
      animation: meshMove 12s infinite alternate ease-in-out;
    }

    @keyframes meshMove {
      0% {
        transform: scale(1) rotate(0deg);
      }
      50% {
        transform: scale(1.1) rotate(10deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
      }
    }

    /* Floating CTA Button */
    .animate-float {
      animation: float 3.5s ease-in-out infinite;
    }

    @keyframes float {
      0% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-8px);
      }
      100% {
        transform: translateY(0px);
      }
    }

    /* Dark Mode Adjustment for Mesh */
    :global(.dark) .gradient-mesh {
      background: radial-gradient(
          circle at 20% 20%,
          rgba(59, 130, 246, 0.2),
          transparent 50%
        ),
        radial-gradient(
          circle at 80% 30%,
          rgba(14, 165, 233, 0.2),
          transparent 50%
        ),
        radial-gradient(
          circle at 50% 80%,
          rgba(6, 182, 212, 0.2),
          transparent 50%
        );
    }
  `}</style>
        </section>

        <Footer />
      </div>
    </CustomLayout>
  );
}
