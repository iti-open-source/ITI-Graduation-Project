import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
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
              <Button asChild size="lg" className="shadow-lg hover:scale-105 transition">
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:scale-105 transition"
              >
                <Link href="/lobby">Try a Demo</Link>
              </Button>
            </div>
          </div>
        </section>


        {/* Pricing */}
        <Pricing />

        {/* Contact */}
        <section
          id="contact"
          className="flex items-center justify-center dark:from-slate-900 dark:via-slate-950 dark:to-blue-950 py-24"
        style={{ background: "linear-gradient(90deg, rgba(88,98,214,0.98) 0%, rgba(36,193,218,0.98) 100%)" }}
        >
          <motion.div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
              Contact Us
            </h2>
            <p className="text-blue-100 text-lg mb-12">
              Have a question or need help? We’re here for you.
            </p>

            <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-xl p-10 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                Send us an email
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                For any questions, send an email to:
              </p>

              <a
                href="mailto:support@mockmate.com"
                className="inline-block bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold py-3 px-8 rounded-xl transition"
              >
                support@mockmate.com
              </a>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </CustomLayout>
  );
}