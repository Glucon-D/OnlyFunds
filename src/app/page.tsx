/**
 * Home Page Component
 *
 * The landing page of the OnlyFunds application. Displays a welcome message
 * and redirects authenticated users to the dashboard. For unauthenticated users,
 * it shows the application features and provides links to login and signup.
 */

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/zustand';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from "@/lib/utils/cn";
import Link from 'next/link';
import { Spotlight } from '@/components/ui/Spotlight';
import { TextGenerateEffect } from '@/components/ui/TextGenerateEffect';
import GradientButton from '@/components/ui/GradientButton';
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import {
  IconBoxAlignRightFilled,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { id } from 'zod/v4/locales';



export default function Home() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { isLoggedIn, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 5,
  }));

  if (isLoading) {
    return <AuthPageLoader message="Checking authentication..." />;
  }

  if (isLoggedIn) {
    return null; // Will redirect to dashboard
  }

  return (
    <div>
      <div className="relative h-screen overflow-x-hidden">

        {/* Hero Section */}
        <Spotlight className='-top-40 -left-10 md:-left-32 md:-top-20 h-screen' fill='var(--primary)' />
        <Spotlight className='top-10 left-full h-[100vh] w-[50vw]' fill='var(--accent)' />
        <Spotlight className='top-28 left-80 h-[80vh] w-[50vw]' fill='#64748b' />

        <div className="flex h-screen w-full items-center justify-center bg-slate-900 absolute top-0 left-0">
          <div
            className={cn(
              "absolute inset-0",
              "[background-size:40px_40px]",
              "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
              "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
            )}
          />
          {/* Radial gradient for the container to give a faded look */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-slate-900"></div>
          <div className='flex justify-center relative my-20 z-10'>
            <div className='max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center'>
              <TextGenerateEffect className='text-center text-9xl pb-3 ' words='OnlyFunds' />
              <h2 className='uppercase tracking-widest sm:text-xs lg:text-xl text-center text-emerald-800 dark:text-emerald-100'>Take control of your personal finances with simple expense tracking, budget management, and financial insights.</h2>

              <Link href="/login">
                <GradientButton />
              </Link>

            </div>
          </div>
        </div>
      </div>
      <div className='bg-slate-900 p-7'>
        <section id='about'>
          <BentoGrid>
            {[
              // { title: 'Title1', description: 'Desc1', id: 1 },
              // { title: 'Title1', description: 'Desc1', id: 1 },
              // { title: 'Title1', description: 'Desc1', id: 1 },
              // { title: 'Title1', description: 'Desc1', id: 1 },
              {
                id: 1,
                title: "Track Expenses",
                description: "Easily record your income and expenses with detailed categorization and date tracking",
                className: "col-span-1 md:col-span-2 lg:col-span-2",
                imgClassName: "w-full h-full",
                titleClassName: "justify-end",
                img: "/b1.svg",
                spareImg: "",
              },
              {
                id: 2,
                title: "Budget Management",
                description: "Set monthly budgets for different categories and track your spending progress in real-time",
                className: "",
                imgClassName: "",
                titleClassName: "justify-start",
                img: "",
                spareImg: "",
              },
              {
                id: 3,
                title: "Dark Mode",
                description: "Enjoy a beautiful interface with both light and dark themes that adapts to your preferences",
                className: "",
                imgClassName: "",
                titleClassName: "justify-center",
                img: "",
                spareImg: "",
              },
              {
                id: 4,
                title: "Natural Language Input",
                description: "Just type what your expenses in natural language. OnlyFunds understands and add them for you",
                className: "col-span-1 md:col-span-2 lg:col-span-2",
                imgClassName: "",
                titleClassName: "justify-center",
                img: "",
                spareImg: "",
              },
            ].map((item) => (
              <BentoGridItem
                id={item.id}
                key={item.id}
                title={item.title}
                description={item.description}
                className={item.className}
              />
            ))}
          </BentoGrid>
        </section>
      </div>
    </div>

  );
}
