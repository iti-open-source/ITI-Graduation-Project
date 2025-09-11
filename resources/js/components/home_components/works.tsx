import { motion } from "framer-motion";

export default function Works() {

    return(
        <section
  id="how-it-works"
  className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950"
>
  <div className="absolute inset-0">
    {/* optional decorative gradient circles */}
    <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-200 dark:bg-blue-800 opacity-20 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-200 dark:bg-cyan-800 opacity-20 rounded-full blur-3xl"></div>
  </div>

  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* small heading */}
    <div className="flex items-center justify-center gap-2 mb-4">
      <img src="/apple-touch-icon.png" alt="Logo" className="w-6 h-6" />
      <span className="text-primary font-semibold uppercase tracking-wider">
        How It Works
      </span>
    </div>

    <motion.h2
      className="mb-16 text-center text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
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
     
      <div className="hidden md:block absolute top-0 left-1/2 h-full w-0.5 bg-gradient-to-b from-blue-400 to-cyan-400"></div>

      <div className="space-y-16">
        {[
          {
            step: "Schedule Interviews",
            desc: "Organize structured interview sessions with customizable templates and flexible scheduling.",
            icon: "📅",
          },
          {
            step: "Collaborate in Real-Time",
            desc: "Engage in coding sessions, whiteboard discussions, or structured Q&A within interactive rooms.",
            icon: "🤝",
          },
          {
            step: "Get Actionable Insights",
            desc: "Receive instant AI-powered feedback and performance analytics for continuous improvement.",
            icon: "📊",
          },
        ].map((item, i) => (
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
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white flex items-center justify-center text-3xl shadow-lg">
                    {item.icon}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 mt-6 md:mt-0">
              <div
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg p-8 hover:shadow-xl transition"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-bold">
                    {i + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {item.step}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
</section>
    );
}