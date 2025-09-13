import { Button } from "@/components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import Footer from "@/components/home_components/footer";
import CustomLayout from "@/layouts/custom-layout";
import "swiper/css";
import "swiper/css/navigation";
import Services from "@/components/home_components/services";
import Hero from "@/components/home_components/hero";
import About from "@/components/home_components/about";
import Features from "@/components/home_components/features";
import Works from "@/components/home_components/works";
import Pricing from "@/components/home_components/pricing";

export default function Home() {

    const { auth } = usePage().props as { auth: { user?: { role: string } } };
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
      <div className="min-h-screen bg-background text-foreground">
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
        <section className="relative py-16 text-center 
          bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-100 
          dark:from-slate-900 dark:via-blue-900 dark:to-indigo-800">
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
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              {getStartedLink && (
                <Button asChild size="lg" className="shadow-lg hover:scale-105 transition">
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
        <Pricing />

        {/* Contact */}
<section
  id="contact"
  className="relative py-28 overflow-hidden text-center"
>
 
  <div className="absolute inset-0 -z-10">
    <div className="absolute w-[140%] h-[140%] -top-1/4 -left-1/4 gradient-mesh"></div>
  </div>

  <motion.div
    className="relative max-w-4xl mx-auto px-6 z-10 backdrop-blur-md bg-white/60 dark:bg-slate-900/40 rounded-3xl p-10 shadow-lg border border-white/20 dark:border-slate-700/40"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
  >
    <h2 className="text-5xl sm:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
      Let’s Connect 🌸
    </h2>
    <p className="text-slate-700 dark:text-slate-300 text-lg sm:text-xl mb-12">
      Have a question or just want to say hi?  
      We’d love to hear from you.
    </p>

    <a
      href="mailto:support@mockmate.com"
      className="inline-block bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-700 hover:to-sky-600 text-white font-semibold py-4 px-10 rounded-2xl shadow-xl hover:shadow-blue-400/40 transition animate-float"
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