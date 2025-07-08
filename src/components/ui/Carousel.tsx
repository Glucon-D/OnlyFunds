"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Card, CardContent } from "./Card";

interface Testimonial {
  quote: string;
  author: string;
}

interface CarouselProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  interval?: number;
}

const Carousel: React.FC<CarouselProps> = ({
  testimonials,
  autoplay = true,
  interval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 0 for initial, 1 for next, -1 for prev

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  }, [testimonials.length]);

  useEffect(() => {
    if (autoplay) {
      const timer = setInterval(handleNext, interval);
      return () => clearInterval(timer);
    }
  }, [autoplay, interval, handleNext]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: "0%",
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative h-64 overflow-hidden rounded-2xl">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full h-full flex flex-col justify-center">
              <CardContent className="text-center">
                <p className="text-slate-600 dark:text-slate-300 text-lg mb-4 italic">
                  &quot;{testimonials[currentIndex].quote}&quot;
                </p>
                <p className="font-semibold text-green-500 text-xl">
                  - {testimonials[currentIndex].author}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 dark:bg-slate-700/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors z-20"
        aria-label="Previous testimonial"
      >
        <FiChevronLeft className="text-gray-700 dark:text-gray-200 text-2xl" />
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 dark:bg-slate-700/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors z-20"
        aria-label="Next testimonial"
      >
        <FiChevronRight className="text-gray-700 dark:text-gray-200 text-2xl" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${
              currentIndex === idx ? "bg-green-500" : "bg-gray-400 dark:bg-gray-600"
            }`}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
