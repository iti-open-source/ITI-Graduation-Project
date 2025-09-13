
import { Button } from "@/components/ui/button";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
export default function Hero() {

  const { auth } = usePage().props as {
    auth: { user?: { role: string } };
  };

  const userRole = auth?.user?.role;


  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

    return(

 <header id="home" className="relative h-screen overflow-hidden 
          bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-100 
          dark:from-slate-900 dark:via-blue-900 dark:to-indigo-800">

      
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent blur-3xl"></div>

          <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
            <motion.h1
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mb-6 text-4xl leading-tight font-extrabold md:text-6xl 
              bg-clip-text text-transparent 
              bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-300 dark:to-blue-400"
            >
              Smarter Interview Rooms for Institutes & Professionals
            </motion.h1>
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              Host structured interviews, practice coding challenges, or join a discussion room
              tailored to your interests — all in one seamless platform.
            </motion.p>
            <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col justify-center gap-4 sm:flex-row"
        >
           {/* Guest → Get Started */}
          {!auth?.user && (
            <motion.div variants={fadeIn}>
              <Button asChild size="lg" className="shadow-lg hover:scale-105 transition">
                <Link href="/login">✨ Get Started</Link>
              </Button>
            </motion.div>
          )}
          {/* Instructor or Admin → Create Room */}
          {(userRole === "instructor" || userRole === "admin") && (
            <motion.div variants={fadeIn}>
              <Button asChild size="lg" className="shadow-lg hover:scale-105 transition">
                <Link href="/lobby">🚀 Create a Room</Link>
              </Button>
            </motion.div>
          )}

          {/* Unassigned → Join Random Room */}
          {userRole === null && (
            <motion.div variants={fadeIn}>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="backdrop-blur-md border-border text-foreground hover:scale-105 transition"
              >
                <Link href="/lobby">🎯 Join Random Room</Link>
              </Button>
            </motion.div>
          )}

          {/* Student → Join Room + Join Random Room */}
          {userRole === "student" && (
            <>
              <motion.div variants={fadeIn}>
                <Button asChild size="lg" className="shadow-lg hover:scale-105 transition">
                  <Link href="/lobby">📚 Join Room</Link>
                </Button>
              </motion.div>
              <motion.div variants={fadeIn}>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="backdrop-blur-md border-border text-foreground hover:scale-105 transition"
                >
                  <Link href="/lobby">🎯 Join Random Room</Link>
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 w-full flex justify-center">
            <span className="animate-bounce text-2xl">⬇</span>
          </div>
        </header>

    );
}