import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/navigation';

import Navbar from '@/components/home_components/navbar';
import Footer from '@/components/home_components/footer';

export default function Home({ features = [] }) {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const defaultFeatures = [
    { title: 'Real-Time Coding', desc: 'Collaborate live with an integrated editor designed for technical interviews.', icon: '💻' },
    { title: 'Actionable Feedback', desc: 'AI-powered analysis with detailed reports to help candidates improve faster.', icon: '📊' },
    { title: 'Simulated Interviews', desc: 'Practice with mock interview rooms that mirror real-world scenarios.', icon: '🎤' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-inter">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <header className="h-screen bg-gradient-to-r from-[var(--color-header-bg-start)] to-[var(--color-header-bg-end)] text-[var(--color-nav-text)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center">
          <motion.h1
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Smarter Interview Rooms for Institutes & Professionals
          </motion.h1>
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl mb-10 max-w-2xl text-[var(--color-text-secondary)]"
          >
            Host structured interviews, practice coding challenges, or join a 
            discussion room tailored to your interests — all in one seamless platform.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-[var(--color-button-primary-bg)] text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-[var(--color-button-primary-hover)] transform hover:scale-105 transition"
            >
              Create a Room
            </Link>
            <Link
              href="#random-room"
              className="bg-[var(--color-button-secondary-bg)] border border-[var(--color-button-secondary-border)] text-[var(--color-button-secondary-text)] px-6 py-3 rounded-lg hover:bg-[var(--color-button-secondary-hover-bg)] hover:text-[var(--color-button-secondary-hover-text)] transition"
            >
              Join Random Room
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 bg-[var(--color-section-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[var(--color-text)] text-center mb-14"
          >
            Why Choose Our Platform?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {(features.length ? features : defaultFeatures).map((f, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-[var(--color-card-bg)] shadow-md rounded-2xl p-8 text-center hover:shadow-xl transform hover:scale-105 transition"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-[var(--color-text)]">{f.title}</h3>
                <p className="mt-3 text-[var(--color-text-secondary)]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[var(--color-section-alt-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[var(--color-text)] text-center mb-14"
          >
            How It Works
          </motion.h2>
          <div className="space-y-10 bg-[var(--color-section-bg)] px-8 md:px-16 py-12 rounded-2xl shadow-lg">
            {[
              { step: 'Schedule Interviews', desc: 'Organize structured interview sessions with customizable templates and flexible scheduling.' },
              { step: 'Collaborate in Real-Time', desc: 'Engage in coding sessions, whiteboard discussions, or structured Q&A within interactive rooms.' },
              { step: 'Get Actionable Insights', desc: 'Receive instant AI-powered feedback and performance analytics for continuous improvement.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-start md:items-center"
              >
                <div className="flex-shrink-0 text-2xl font-bold text-[var(--color-step-number)] mr-6">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-[var(--color-text)]">{step.step}</h3>
                  <p className="mt-2 text-[var(--color-text-secondary)]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
