import { motion } from "framer-motion";
import { BarChart3, Calendar, Handshake } from "lucide-react";

export default function Works() {
  return (
    <section
      id="features"
      className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-24 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950"
    >
      <div className="absolute inset-0">
        {/* optional decorative gradient circles */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200 opacity-20 blur-3xl dark:bg-blue-800"></div>
        <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-200 opacity-20 blur-3xl dark:bg-cyan-800"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* small heading */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <img src="/apple-touch-icon.png" alt="Logo" className="h-6 w-6" />
          <span className="font-semibold tracking-wider text-primary uppercase">How It Works</span>
        </div>

        <motion.h2
          className="mb-16 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Your Journey to{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
            Interview Success
          </span>
        </motion.h2>

        <div className="relative">
          <div className="absolute top-0 left-1/2 hidden h-full w-0.5 bg-gradient-to-b from-blue-400 to-cyan-400 md:block"></div>

          <div className="space-y-16">
            {[
              {
                step: "Schedule Interviews",
                desc: "Organize structured interview sessions with customizable templates and flexible scheduling.",
                icon: Calendar,
              },
              {
                step: "Collaborate in Real-Time",
                desc: "Engage in coding sessions, whiteboard discussions, or structured Q&A within interactive rooms.",
                icon: Handshake,
              },
              {
                step: "Get Actionable Insights",
                desc: "Receive instant AI-powered feedback and performance analytics for continuous improvement.",
                icon: BarChart3,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  className={`md:flex md:items-center md:gap-8 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="md:w-1/2">
                    <div className="flex items-center justify-center md:justify-end">
                      <div className="flex flex-col items-center text-center md:text-right">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg">
                          <Icon className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-0 md:w-1/2">
                    <div className="rounded-3xl bg-white p-8 shadow-lg transition hover:shadow-xl dark:bg-slate-900">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-sm font-bold text-white">
                          {i + 1}
                        </span>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                          {item.step}
                        </h3>
                      </div>
                      <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
