import { motion } from "framer-motion";
import { Brain, Code2, MessageSquare, MicVocal } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Code2,
      title: "Real-Time Coding Practice",
      desc: "Collaborate in a live coding environment tailored for technical interviews.",
    },
    {
      icon: Brain,
      title: "Collaborative Whiteboard",
      desc: "Explain your thought process clearly and visually with a real-time collaborative whiteboard.",
    },
    {
      icon: MessageSquare,
      title: "AI-Powered Feedback",
      desc: "Get instant, actionable feedback on both your technical and behavioral answers.",
    },
    {
      icon: MicVocal,
      title: "Simulated Interview Rooms",
      desc: "Practice in realistic interview sessions to build confidence under pressure.",
    },
  ];
  return (
    <section
      id="features"
      className="relative flex min-h-screen items-center bg-white px-4 py-12 sm:px-6 md:px-12 lg:px-20 lg:py-24 dark:bg-black"
    >
      <div className="mx-auto grid grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="relative grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <motion.img
            src="https://www.digitalglad.com/wp-content/uploads/2024/02/Book-Mock-Interview-With-DigitalGlad.jpg"
            alt="Security operations"
            className="h-[300px] w-full rounded-2xl object-cover shadow-xl sm:h-[400px] lg:h-[520px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          />

          <div className="flex flex-col gap-4 sm:gap-6">
            <motion.img
              src="https://miro.medium.com/v2/resize:fit:875/1*bp8lGZWCx1W4__WHUqBAUA.jpeg"
              alt="Analyst at work"
              className="h-[140px] w-full rounded-2xl object-cover shadow-xl sm:h-[200px] lg:h-[250px]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            />

            <motion.div
              className="flex h-[140px] flex-col items-center justify-center rounded-2xl p-4 text-white shadow-lg sm:h-[200px] sm:p-6 lg:h-[250px]"
              style={{
                background:
                  "linear-gradient(30deg, rgba(88,98,214,0.98) 0%, rgba(36,193,218,0.98) 100%)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <h3 className="text-2xl font-bold sm:text-3xl lg:text-4xl">8,000+</h3>
              <p className="mt-1 text-center text-xs sm:text-sm">
                Live mock interviews
                <br />
                hosted this year
              </p>
              <div className="mt-2 flex -space-x-2 sm:mt-3">
                <img
                  src="/images/session1.jpg"
                  className="h-6 w-6 rounded-full border-2 border-white sm:h-8 sm:w-8"
                />
                <img
                  src="/images/session2.jpg"
                  className="h-6 w-6 rounded-full border-2 border-white sm:h-8 sm:w-8"
                />
                <img
                  src="/images/session3.jpg"
                  className="h-6 w-6 rounded-full border-2 border-white sm:h-8 sm:w-8"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right: Text */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <img src="/apple-touch-icon.png" alt="Logo" className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-sm font-semibold tracking-wider text-primary uppercase sm:text-base">
              Features
            </span>
          </div>

          <motion.h2
            className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl lg:text-5xl dark:text-white"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            Practice smarter with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              MockMate Features
            </span>
          </motion.h2>

          <motion.p
            className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-300"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
          >
            Everything you need to excel at technical and behavioral interviews, from live practice
            sessions to AI-driven feedback.
          </motion.p>

          <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                      {f.title}
                    </h3>
                    <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
