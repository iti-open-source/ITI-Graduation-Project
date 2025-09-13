import { usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Code2, MessageSquare, MicVocal } from "lucide-react";

export default function Features() {
   const { roomsCount } = usePage().props as { roomsCount: number };
  const features = [
    {
      icon: Code2,
      title: "Real-Time Coding Practice",
      desc: "Collaborate in a live coding environment tailored for technical interviews.",
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
      className="relative flex min-h-screen items-center bg-white px-20 py-24 dark:bg-black"
    >
      <div className="mx-auto grid grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.img
            src="https://www.digitalglad.com/wp-content/uploads/2024/02/Book-Mock-Interview-With-DigitalGlad.jpg"
            alt="Security operations"
            className="h-[520px] w-full rounded-2xl object-cover shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          />

          <div className="flex flex-col gap-6">
            <motion.img
              src="https://miro.medium.com/v2/resize:fit:875/1*bp8lGZWCx1W4__WHUqBAUA.jpeg"
              alt="Analyst at work"
              className="h-[250px] w-full rounded-2xl object-cover shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            />

            <motion.div
              className="flex h-[250px] flex-col items-center justify-center rounded-2xl p-6 text-white shadow-lg"
              style={{
                background:
                  "linear-gradient(30deg, rgba(88,98,214,0.98) 0%, rgba(36,193,218,0.98) 100%)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <h3 className="text-4xl font-bold">{roomsCount}+</h3>
              <p className="mt-1 text-center text-sm">
                Live mock interviews
                <br />
                hosted this year
              </p>
              <div className="mt-3 flex -space-x-2">
                <img
                  src="/images/session1.jpg"
                  className="h-8 w-8 rounded-full border-2 border-white"
                />
                <img
                  src="/images/session2.jpg"
                  className="h-8 w-8 rounded-full border-2 border-white"
                />
                <img
                  src="/images/session3.jpg"
                  className="h-8 w-8 rounded-full border-2 border-white"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right: Text */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <img src="/apple-touch-icon.png" alt="Logo" className="h-6 w-6" />
            <span className="font-semibold tracking-wider text-primary uppercase">Features</span>
          </div>

          <motion.h2
            className="text-3xl font-extrabold tracking-tight text-black sm:text-5xl dark:text-white"
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
            className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
          >
            Everything you need to excel at technical and behavioral interviews, from live practice
            sessions to AI-driven feedback.
          </motion.p>

          <div className="mt-8 space-y-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {f.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
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
