import { useState } from "react";
import { motion } from "framer-motion";
import {
    Bot,
    Brain,
    ChartBar,
    BookOpen,
    UserCheck,
    MessageCircle,
} from "lucide-react";
const services = [
    {
        title: "AI-Powered Mock Interviews",
        description:
            "Practice role-specific interviews with real-time AI prompts and adaptive difficulty.",
        icon: Bot,
    },
    {
        title: "Smart Feedback & Insights",
        description:
            "Receive instant AI feedback on clarity, structure, and confidence with actionable tips.",
        icon: Brain,
    },
    {
        title: "Progress Tracking Dashboard",
        description:
            "Visualize growth with timelines, score breakdowns and personalized milestones.",
        icon: ChartBar,
    },
    {
        title: "Question Bank & Scenarios",
        description:
            "Explore a curated library of role-based questions, puzzles and real-world scenarios.",
        icon: BookOpen,
    },
    {
        title: "Personalized Coaching",
        description:
            "AI-guided learning paths that focus your practice on highest-impact improvements.",
        icon: UserCheck,
    },
    {
        title: "Peer & Mentor Sessions",
        description:
            "Book mentor reviews or join peer practice rooms for human feedback and collaboration.",
        icon: MessageCircle,
    },
];
export default function Services() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (<section id="services" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

            <div className="text-center mb-14">
                {/* <div className="flex items-center mb-3 justify-center gap-2">
  <motion.img
    src="/apple-touch-icon.png"
    alt="Logo"
    className="w-6 h-6"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  />

  <motion.span
    className="text-primary font-semibold uppercase tracking-wider"
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    our services
  </motion.span>
</div> */}

                <div className="flex items-center justify-center gap-2 mb-4">
                    <img src="/apple-touch-icon.png" alt="Logo" className="w-6 h-6" />
                    <span className="text-primary font-semibold uppercase tracking-wider">
                        Our Services
                    </span>
                </div>


                <motion.h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white sm:text-5xl"
                 initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}>
                    Comprehensive{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                        services for success
                    </span>
                </motion.h1>
                <motion.p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}>
                    Everything you need to practice smarter, gain confidence, and land your next role.
                </motion.p>
            </div>

            {/* grid */}
            <motion.div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}>
                {services.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = hoveredIndex === i;

                    return (
                        <motion.div
                            key={s.title}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onFocus={() => setHoveredIndex(i)}
                            onBlur={() => setHoveredIndex(null)}
                            tabIndex={0}
                            role="button"
                            aria-pressed={isActive}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}

                            
                            whileHover={{ y: -6 }}
                            className={`relative group rounded-[28px] p-8 overflow-hidden border border-transparent
                  transition-all duration-700 ease-in-out focus:outline-none bg-white dark:bg-slate-800 hover:border-border hover:shadow-lg cursor-pointer`}
                            style={{
                             
                                boxShadow: isActive
                                    ? "0 18px 40px rgba(37,99,235,0.12)"
                                    : "0 8px 20px rgba(2,6,23,0.06)",
                            }}
                        >
                           
                            <motion.div
                                aria-hidden
                                className="absolute inset-0 rounded-[28px] z-0 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isActive ? 1 : 0 }}
                                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                                style={{
                                    background:
                                        "linear-gradient(90deg, rgba(88,98,214,0.98) 0%, rgba(36,193,218,0.98) 100%)",
                                    transform: "translateZ(0)",
                                    mixBlendMode: "normal",
                                }}
                            />

                            <motion.div
                                aria-hidden
                                className="absolute inset-0 rounded-[28px] z-10 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isActive ? 0.06 : 0 }}
                                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                                style={{
                                    background: "radial-gradient(600px 200px at 30% 20%, rgba(0,0,0,0.05), rgba(0,0,0,0))",
                                    mixBlendMode: "overlay",
                                }}
                            />

                            <motion.span
                                aria-hidden
                                className="absolute top-6 right-10 w-3 h-3 rounded-full z-20"
                                animate={{
                                    scale: isActive ? [0.9, 1.2, 1] : [1, 1],
                                    opacity: isActive ? 0.95 : 0.08,
                                    y: isActive ? [0, -3, 0] : 0,
                                }}
                                transition={{ duration: 1.2, ease: "easeInOut", repeat: 0 }}
                                style={{
                                    background: "rgba(255,255,255,0.33)",
                                    boxShadow: isActive ? "0 6px 18px rgba(36,193,218,0.22)" : undefined,
                                }}
                            />

                            <div className="relative z-20">
                                <div
                                    className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-all duration-700 ease-in-out ${isActive
                                        ? "bg-white/18 text-white"
                                        : "bg-gradient-to-r from-blue-600 to-cyan-400 text-white"
                                        }`}
                                >
                                    <Icon className="w-7 h-7" />
                                </div>

                                <h3
                                    className={`text-lg font-semibold mb-3 transition-colors duration-700 ease-in-out ${isActive ? "text-white" : "text-gray-900 dark:text-white"
                                        }`}
                                >
                                    {s.title}
                                </h3>

                                <p
                                    className={`text-sm leading-relaxed mb-6 transition-colors duration-700 ease-in-out ${isActive ? "text-white/90" : "text-gray-600 dark:text-gray-400"
                                        }`}
                                    style={{ maxWidth: 440 }}
                                >
                                    {s.description}
                                </p>

                                <motion.div
                                    className={`absolute bottom-14 right-2 w-10 h-10 rounded-full flex items-center justify-center z-20
                      transition-all duration-700 ease-in-out`}
                                    animate={{
                                        background: isActive
                                            ? "rgba(255,255,255,0.9)"
                                            : "linear-gradient(90deg,#2563eb,#06b6d4)",
                                        color: isActive ? "#04044dff" : "#fff",
                                        scale: hoveredIndex === i ? 1.06 : 1,
                                    }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                >
                                    <span className="font-bold text-xl">→</span>
                                </motion.div>
                            </div>

                            <div
                                aria-hidden
                                className="pointer-events-none absolute -inset-px rounded-[28px] z-0"
                                style={{
                                    boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,0.06)" : undefined,
                                    borderRadius: 28,
                                    border: isActive ? "1px solid rgba(255,255,255,0.06)" : undefined,
                                }}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    </section>



    );
}