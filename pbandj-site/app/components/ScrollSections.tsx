'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAudio } from './AudioContextProvider';

interface ScrollSection {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  image?: string;
  parallaxOffset?: number;
}

interface ScrollSectionsProps {
  sections?: ScrollSection[];
  onSectionChange?: (sectionId: string) => void;
}

export default function ScrollSections({ sections = [], onSectionChange }: ScrollSectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [inDemoSection, setInDemoSection] = useState(false);
  const audio = useAudio();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      const demo = document.getElementById('demos');
      if (demo) {
        const rect = demo.getBoundingClientRect();
        setInDemoSection(rect.top < window.innerHeight / 2);
      }

      if (!containerRef.current) return;

      const sectionElements = containerRef.current.querySelectorAll('[data-section]');
      sectionElements.forEach((section, idx) => {
        const element = section as HTMLElement;
        const rect = element.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          setActiveSection(idx);
          onSectionChange?.(element.dataset.section || '');
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onSectionChange]);

  // Handle audio fade based on section
  useEffect(() => {
    if (inDemoSection) {
      audio.fadeBackgroundTo(0.1, 0.8);
    } else {
      audio.restoreBackground(0.8);
    }
  }, [inDemoSection, audio]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
          duration: 0.8,
      },
    },
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {sections.length > 0 ? (
        sections.map((section, idx) => (
          <motion.section
            key={section.id}
            data-section={section.id}
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: false, amount: 0.2 }}
            className="relative min-h-screen w-full px-6 py-20 md:px-12 md:py-32 flex flex-col justify-center items-center overflow-hidden"
          >
            {/* Parallax background */}
            {section.image && (
              <motion.div
                className="absolute inset-0 z-0 overflow-hidden"
                style={{
                  y: scrollY * (section.parallaxOffset || 0.5),
                }}
              >
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  className="object-cover"
                  quality={75}
                />
                <div className="absolute inset-0 bg-black/40" />
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              variants={itemVariants}
              className="relative z-10 max-w-4xl mx-auto text-center"
            >
              <motion.h2
                variants={itemVariants}
                className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg"
              >
                {section.title}
              </motion.h2>

              {section.subtitle && (
                <motion.p
                  variants={itemVariants}
                  className="text-xl md:text-2xl text-pink-400 mb-8 drop-shadow-md"
                >
                  {section.subtitle}
                </motion.p>
              )}

              <motion.div variants={itemVariants} className="text-lg text-gray-300 leading-relaxed drop-shadow-md">
                {section.content}
              </motion.div>
            </motion.div>
          </motion.section>
        ))
      ) : (
        <section className="min-h-screen flex flex-col justify-center items-center text-white px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-4">PB&J Sounds</h1>
            <p className="text-xl md:text-2xl text-pink-400">The intersection of light, sound, and energy.</p>
          </motion.div>
        </section>
      )}
    </div>
  );
}
