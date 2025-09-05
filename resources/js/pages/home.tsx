import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/navigation';

import Footer from '@/components/home_components/footer';
import CustomLayout from '@/layouts/custom-layout';

export default function Home({ features = [] }) {
    const props = usePage().props;

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
        <CustomLayout isLoggedIn={props.isLoggedIn as boolean}>
            <div className="font-inter min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
                {/* Hero */}
                <header className="h-screen bg-gradient-to-r from-[var(--color-header-bg-start)] to-[var(--color-header-bg-end)] text-[var(--color-nav-text)]">
                    <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
                        <motion.h1 variants={fadeIn} initial="hidden" animate="visible" className="mb-6 text-4xl leading-tight font-bold md:text-6xl">
                            Smarter Interview Rooms for Institutes & Professionals
                        </motion.h1>
                        <motion.p
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            className="mb-10 max-w-2xl text-lg text-[var(--color-text-secondary)] md:text-xl"
                        >
                            Host structured interviews, practice coding challenges, or join a discussion room tailored to your interests — all in one
                            seamless platform.
                        </motion.p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href="/lobby"
                                className="transform rounded-lg bg-[var(--color-button-primary-bg)] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[var(--color-button-primary-hover)]"
                            >
                                Create a Room
                            </Link>
                            <Link
                                href="/lobby"
                                className="rounded-lg border border-[var(--color-button-secondary-border)] bg-[var(--color-button-secondary-bg)] px-6 py-3 text-[var(--color-button-secondary-text)] transition hover:bg-[var(--color-button-secondary-hover-bg)] hover:text-[var(--color-button-secondary-hover-text)]"
                            >
                                Join Random Room
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Features */}
                <section className="bg-[var(--color-section-bg)] py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.h2
                            variants={fadeIn}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="mb-14 text-center text-3xl font-bold text-[var(--color-text)] md:text-4xl"
                        >
                            Why Choose Our Platform?
                        </motion.h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            {(features.length ? features : defaultFeatures).map((f, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeIn}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="transform rounded-2xl bg-[var(--color-card-bg)] p-8 text-center shadow-md transition hover:scale-105 hover:shadow-xl"
                                >
                                    <div className="mb-4 text-4xl">{f.icon}</div>
                                    <h3 className="text-xl font-semibold text-[var(--color-text)]">{f.title}</h3>
                                    <p className="mt-3 text-[var(--color-text-secondary)]">{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-[var(--color-section-alt-bg)] py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.h2
                            variants={fadeIn}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="mb-14 text-center text-3xl font-bold text-[var(--color-text)] md:text-4xl"
                        >
                            How It Works
                        </motion.h2>
                        <div className="space-y-10 rounded-2xl bg-[var(--color-section-bg)] px-8 py-12 shadow-lg md:px-16">
                            {[
                                {
                                    step: 'Schedule Interviews',
                                    desc: 'Organize structured interview sessions with customizable templates and flexible scheduling.',
                                },
                                {
                                    step: 'Collaborate in Real-Time',
                                    desc: 'Engage in coding sessions, whiteboard discussions, or structured Q&A within interactive rooms.',
                                },
                                {
                                    step: 'Get Actionable Insights',
                                    desc: 'Receive instant AI-powered feedback and performance analytics for continuous improvement.',
                                },
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeIn}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="flex items-start md:items-center"
                                >
                                    <div className="mr-6 flex-shrink-0 text-2xl font-bold text-[var(--color-step-number)]">{i + 1}</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[var(--color-text)] md:text-xl">{step.step}</h3>
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
        </CustomLayout>
    );
}
