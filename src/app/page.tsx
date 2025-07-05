/**
 * Home Page Component
 *
 * The landing page of the OnlyFunds application. Displays a welcome message
 * and redirects authenticated users to the dashboard. For unauthenticated users,
 * it shows the application features and provides links to login and signup.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/zustand";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AuthPageLoader } from "@/components/ui/AuthLoader";
import { motion, Variants } from "framer-motion";
import { ParticlesComponent } from "@/components/ui/Particles";
import Carousel from "@/components/ui/Carousel";
import {
  FiDollarSign,
  FiArrowRight,
  FiCheckCircle,
  FiTrendingUp,
  FiCloud,
  FiZap,
  FiShield,
  FiTarget,
  FiEye,
} from "react-icons/fi";
import {
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiAppwrite,
  SiZod,
} from "react-icons/si";
import { BsLightningChargeFill } from "react-icons/bs";

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  if (isLoading) {
    return <AuthPageLoader message="Checking authentication..." />;
  }

  if (isLoggedIn) {
    return null; // Will redirect to dashboard
  }

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.2, delayChildren: i * 0.1 },
    }),
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const features = [
    {
      icon: FiCloud,
      title: "Cloud Sync & Offline Mode",
      description:
        "Your data is always safe and available. Work offline and sync seamlessly to the cloud with Appwrite integration.",
    },
    {
      icon: FiZap,
      title: "Blazingly Fast",
      description:
        "Engineered for speed with a performance-first approach, featuring optimized components and instant calculations.",
    },
    {
      icon: FiShield,
      title: "Secure by Design",
      description:
        "Rely on robust, server-side authentication from Appwrite and data validation with Zod to keep your information safe.",
    },
    {
      icon: FiTarget,
      title: "Advanced Budgeting",
      description:
        "Create, manage, and track monthly budgets with high-performance progress bars and instant updates.",
    },
    {
      icon: FiTrendingUp,
      title: "Insightful Analytics",
      description:
        "Gain a deeper understanding of your spending habits with detailed reports and trend analysis. (Coming Soon)",
    },
    {
      icon: FiEye,
      title: "Modern & Intuitive UI",
      description:
        "Enjoy a beautiful, responsive interface with light and dark modes, designed for a seamless user experience.",
    },
  ];

  const techStack = [
    { icon: SiNextdotjs, name: "Next.js 15" },
    { icon: SiTypescript, name: "TypeScript" },
    { icon: SiTailwindcss, name: "Tailwind CSS v4" },
    { icon: SiAppwrite, name: "Appwrite" },
    { icon: BsLightningChargeFill, name: "Zustand" },
    { icon: SiZod, name: "Zod" },
  ];

  const testimonials = [
    {
      quote:
        "OnlyFunds has been a game-changer for my finances. I finally feel in control of my spending.",
      author: "Alex P.",
    },
    {
      quote:
        "The best finance app I've ever used. It's simple, beautiful, and incredibly effective.",
      author: "Sarah K.",
    },
    {
      quote:
        "I love how easy it is to track my expenses and see where my money is going. Highly recommend!",
      author: "John D.",
    },
    {
      quote:
        "The budgeting features are fantastic. I've saved so much since I started using OnlyFunds.",
      author: "Emily R.",
    },
    {
      quote:
        "Finally, a finance app that doesn't overcomplicate things. Clean, intuitive, and powerful.",
      author: "Michael B.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-x-hidden">
      <ParticlesComponent id="tsparticles" />
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Hero Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-32"
        >
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <FiDollarSign className="text-white text-6xl" />
            </div>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent"
          >
            Welcome to OnlyFunds
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            The simple, elegant, and powerful way to manage your personal
            finances. Gain clarity and take control of your financial future.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button
              size="lg"
              variant="primary"
              onClick={() => router.push("/signup")}
            >
              Get Started for Free <FiArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-32"
        >
          <h2 className="text-4xl font-bold text-center mb-6">
            A Smarter Way to Manage Your Money
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            OnlyFunds is packed with features designed to give you clarity and
            control over your finances.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div variants={itemVariants} key={i}>
                <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 h-full p-2">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-32"
        >
          <h2 className="text-4xl font-bold text-center mb-6">
            Built with a Modern Tech Stack
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            We use cutting-edge technology to deliver a fast, reliable, and
            secure experience.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6">
            {techStack.map((tech, i) => (
              <motion.div
                variants={itemVariants}
                key={i}
                className="flex flex-col items-center justify-center gap-2 text-center"
              >
                <div className="w-20 h-20 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                  <tech.icon className="text-4xl text-emerald-500" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-32"
        >
          <h2 className="text-4xl font-bold text-center mb-16">
            What Our Users Say
          </h2>
          <Carousel testimonials={testimonials} />
        </motion.section>

        {/* CTA Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-emerald-400/20 to-green-400/20 dark:from-emerald-900/30 dark:to-green-900/30 rounded-3xl p-16 shadow-xl border border-emerald-200/50 dark:border-emerald-800/50">
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-slate-900 dark:text-white mb-6"
            >
              Ready to Build Your Financial Future?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto"
            >
              Take the first step towards financial freedom. It&apos;s free to
              get started.
            </motion.p>
            <motion.div variants={itemVariants}>
              <Button
                size="lg"
                variant="primary"
                onClick={() => router.push("/signup")}
              >
                Sign Up Now <FiCheckCircle className="ml-2" />
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}