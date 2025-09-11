import { motion } from "framer-motion";
import { Code2, MessageSquare, MicVocal } from "lucide-react";

export default function Features() {

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
            className="relative min-h-screen flex items-center px-20 py-24 bg-white dark:bg-black"
        >
            <div className="mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                 
                    <motion.img
                        src="https://www.digitalglad.com/wp-content/uploads/2024/02/Book-Mock-Interview-With-DigitalGlad.jpg"
                        alt="Security operations"
                        className="rounded-2xl shadow-xl object-cover w-full h-[520px]"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    />

                  
                    <div className="flex flex-col gap-6">
                        <motion.img
                            src="https://miro.medium.com/v2/resize:fit:875/1*bp8lGZWCx1W4__WHUqBAUA.jpeg"
                            alt="Analyst at work"
                            className="rounded-2xl shadow-xl object-cover w-full h-[250px]"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        />

                      
                        <motion.div
                            className=" rounded-2xl flex flex-col items-center justify-center text-white p-6 h-[250px] shadow-lg"
                            style={{ background: "linear-gradient(30deg, rgba(88,98,214,0.98) 0%, rgba(36,193,218,0.98) 100%)" }}

                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9 }}
                        >
                            <h3 className="text-4xl font-bold">8,000+</h3>
                            <p className="text-sm mt-1 text-center">
                                Live mock interviews<br />hosted this year
                            </p>
                            <div className="flex mt-3 -space-x-2">
                                <img src="/images/session1.jpg" className="w-8 h-8 rounded-full border-2 border-white" />
                                <img src="/images/session2.jpg" className="w-8 h-8 rounded-full border-2 border-white" />
                                <img src="/images/session3.jpg" className="w-8 h-8 rounded-full border-2 border-white" />
                            </div>
                        </motion.div>


                    </div>
                </div>

                {/* Right: Text */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <img src="/apple-touch-icon.png" alt="Logo" className="w-6 h-6" />
                        <span className="text-primary font-semibold uppercase tracking-wider">
                            Features
                        </span>
                    </div>

                    <motion.h2
                        className="text-3xl font-extrabold tracking-tight text-black dark:text-white sm:text-5xl"
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
                        className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9 }}
                    >
                        Everything you need to excel at technical and behavioral interviews,
                        from live practice sessions to AI-driven feedback.
                    </motion.p>

                    <div className="mt-8 space-y-6">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                            {f.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            {f.desc}
                                        </p>
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
