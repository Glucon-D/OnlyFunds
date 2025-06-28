/**
 * Home Page Component
 *
 * The landing page of the OnlyFunds application. Displays a welcome message
 * and redirects authenticated users to the dashboard. For unauthenticated users,
 * it shows the application features and provides links to login and signup.
 */

'use client';

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

export default function Home() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { isLoggedIn, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
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
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return null; // Will redirect to dashboard
  }

  return (
      <div className="relative h-screen overflow-hidden">

        {/* Hero Section */}
        <Spotlight className='-top-40 -left-10 md:-left-32 md:-top-20 h-screen' fill='var(--primary)'/>
        <Spotlight className='top-80 left-full h-[100vh] w-[50vw]' fill='var(--accent)'/>
        <Spotlight className='top-28 left-80 h-[80vh] w-[50vw]' fill='#64748b'/>
        
        <div className="flex h-screen w-full items-center justify-center bg-background absolute top-0 left-0">
              <div
                className={cn(
                  "absolute inset-0",
                  "[background-size:40px_40px]",
                  "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
                  "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
                )}
              />
              {/* Radial gradient for the container to give a faded look */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-slate-950"></div>
              <div className='flex justify-center relative my-20 z-10'>
                <div className='max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center'>
                  <TextGenerateEffect className='text-center text-9xl pb-3 ' words='OnlyFunds'/>
                  <h2 className='uppercase tracking-widest sm:text-xs lg:text-xl text-center text-emerald-100'>Take control of your personal finances with simple expense tracking, budget management, and financial insights.</h2>

                <Link href="/login">
                  <GradientButton/>
                </Link>

                </div>
              </div>
            </div>


                
      
      </div>
  );
}
