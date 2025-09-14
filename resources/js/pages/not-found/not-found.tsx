import { Button } from "@/components/ui/button";
import CustomLayout from "@/layouts/custom-layout";
import { Head, Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search } from "lucide-react";

interface NotFoundProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role: string | null;
    [key: string]: any;
  } | null;
}

export default function NotFound() {
  const { user } = usePage().props as NotFoundProps;
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const bounceIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        type: "spring" as const,
        bounce: 0.4,
      },
    },
  };
  return (
    <CustomLayout>
      <Head title="Page Not Found" />
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8">
        <div className="w-full max-w-2xl">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="space-y-8 text-center"
          >
            {/* 404 Number with Icon */}
            <motion.div variants={bounceIn} initial="hidden" animate="visible" className="relative">
              <div className="relative inline-block">
                <h1 className="text-9xl font-bold text-[var(--color-text)] opacity-20 select-none md:text-[12rem]">
                  404
                </h1>
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div variants={fadeIn} className="space-y-4">
              <h2 className="text-3xl font-bold text-[var(--color-text)] md:text-4xl">
                Oops! Page Not Found
              </h2>
              <p className="mx-auto max-w-md text-lg text-[var(--color-text-secondary)]">
                The page you're looking for doesn't exist or has been moved. Let's get you back on
                track.
              </p>
            </motion.div>

            {/* Action Card */}
            <motion.div variants={fadeIn} className="mt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 gap-3 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Link href="/">
                    <Home className="h-5 w-5" />
                    Go Home
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 gap-3 border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-card-bg)]"
                >
                  {user?.role != "admin" ? (
                    <Link href="/lobby">
                      <Search className="h-5 w-5" />
                      Go to Lobby
                    </Link>
                  ) : (
                    <Link href="/admin">
                      <Search className="h-5 w-5" />
                      Go to Dashboard
                    </Link>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </CustomLayout>
  );
}
