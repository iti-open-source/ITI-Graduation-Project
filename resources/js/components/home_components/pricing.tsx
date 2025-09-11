import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function Pricing() {
   const plans = [
    {
      title: "Free",
      price: "$0",
      desc: "Basic features for individuals.",
      features: ["Access to mock rooms", "Basic analytics", "Community support"],
      popular: false,
    },
    {
      title: "Pro",
      price: "$19/mo",
      desc: "Advanced features for professionals.",
      features: [
        "Unlimited mock interviews",
        "Advanced analytics",
        "Priority support",
      ],
      popular: true,
    },
    {
      title: "Enterprise",
      price: "Custom",
      desc: "Tailored solutions for institutes.",
      features: [
        "Team accounts",
        "Custom dashboards",
        "Dedicated success manager",
      ],
      popular: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-24 min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="flex items-center gap-2 mb-4">
            <img src="/apple-touch-icon.png" alt="Logo" className="w-6 h-6" />
            <span className="text-primary font-semibold uppercase tracking-wider">
              Pricing Plans
            </span>
          </div>
          <motion.h2
            className="text-3xl font-extrabold tracking-tight text-black dark:text-white sm:text-5xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            Affordable{" "}
            
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                        Plans for every need
                    </span>
                
          </motion.h2>
        <p className="text-muted-foreground mb-12">
          Choose a plan that fits your interview preparation journey.
        </p>

        <motion.div className="grid md:grid-cols-3 gap-8"
        initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7 }}
        >
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`relative p-8 rounded-3xl backdrop-blur-sm bg-white/90 dark:bg-slate-900/80 shadow-xl transition hover:shadow-2xl hover:-translate-y-1`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                  Most Popular
                </span>
              )}

              <CardHeader>
                <CardTitle className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  {plan.title}
                </CardTitle>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {plan.price}
                </p>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                  {plan.desc}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-blue-500">✔</span> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 w-full rounded-xl py-3 font-semibold text-white ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
      
    </section>
  );
}
