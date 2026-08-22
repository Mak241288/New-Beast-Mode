import React from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, ChevronRight, Trophy, Zap, Shield, Play } from 'lucide-react';

interface HeroSectionProps {
  onStartTraining?: () => void;
  onExploreExercises?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartTraining,
  onExploreExercises,
}) => {
  const headline = 'Unleash Your Inner Beast';
  const words = headline.split(' ');

  // Container variants for orchestrating staggered child animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  // Child variant for each staggered word with kinetic blur & spring slide
  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // Subtitle fade & rise
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: 'easeOut' as const,
      },
    },
  };

  // 3D Gym Mockup spring entrance
  const mockupEntranceVariants = {
    hidden: {
      opacity: 0,
      scale: 0.85,
      y: 60,
      rotateX: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring' as const,
        bounce: 0.4,
        duration: 1.2,
        delay: 0.4,
      },
    },
  };

  // Floating stat badge variant
  const floatBadgeVariants = (delay: number) => ({
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        bounce: 0.3,
        delay,
      },
    },
  });

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-[#070913] text-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Staggered Kinetic Typography & CTAs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col items-start text-left space-y-6"
        >
          {/* Top Pill / Badge */}
          <motion.div
            variants={fadeUpVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs sm:text-sm font-semibold tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI Hypertrophy & Periodization Engine</span>
          </motion.div>

          {/* Main Headline: Staggered Word by Word */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] uppercase font-sans">
            <span className="sr-only">{headline}</span>
            <div aria-hidden="true" className="flex flex-wrap gap-x-3 sm:gap-x-4">
              {words.map((word, idx) => {
                const isBeast = word.toLowerCase() === 'beast';
                return (
                  <motion.span
                    key={idx}
                    variants={wordVariants}
                    className={`inline-block ${
                      isBeast
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 drop-shadow-[0_0_25px_rgba(45,212,191,0.35)]'
                        : 'text-white'
                    }`}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>
          </h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUpVariants}
            className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed font-medium"
          >
            Master your training with 4,200+ enriched biomechanical exercises, smart RPE autoregulation, automated CNS recovery metrics, and zero-compromise precision.
          </motion.p>

          {/* CTAs and Social Proof */}
          <motion.div
            variants={fadeUpVariants}
            className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto"
          >
            {/* Primary Action Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartTraining}
              className="relative group px-8 py-4 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-shadow hover:shadow-[0_0_35px_rgba(6,182,212,0.6)]"
            >
              <Flame className="w-5 h-5 fill-current" />
              <span>Start Training</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>

            {/* Secondary Action Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExploreExercises}
              className="px-6 py-4 rounded-xl font-semibold text-sm sm:text-base text-slate-300 bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:text-white flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md transition-colors"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              <span>Explore Library</span>
            </motion.button>
          </motion.div>

          {/* Live User Metrics Row */}
          <motion.div
            variants={fadeUpVariants}
            className="flex items-center gap-6 pt-4 text-xs sm:text-sm text-slate-400 border-t border-slate-800/80 w-full"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>100% Science-Backed</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>4,298 Enriched Moves</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Realtime Cloud Sync</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: 3D Spring Animated Mockup / Hero Showcase */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Main Card Mockup */}
          <motion.div
            variants={mockupEntranceVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-950/90 p-5 border border-slate-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-xl"
          >
            {/* Mockup Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-bold text-slate-400 ml-2">BEASTMODE_OS v2.4</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                ACTIVE
              </span>
            </div>

            {/* Exercise Preview Card Inside Mockup */}
            <div className="space-y-4">
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"
                  alt="Workout Training"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Barbell Bench Press</h4>
                    <p className="text-xs text-slate-400">Target: Chest & Triceps</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Set 3 / 4
                  </span>
                </div>
              </div>

              {/* Set Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Target</span>
                  <span className="text-white font-bold text-sm">8-10 Reps</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Weight</span>
                  <span className="text-cyan-400 font-bold text-sm">95 kg</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Target RPE</span>
                  <span className="text-emerald-400 font-bold text-sm">8.5 (@1.5)</span>
                </div>
              </div>

              {/* Progress Bar & Rest Timer Mock */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs text-slate-300 font-semibold">Rest Timer</span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">00:45</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Badge 1: Hypertrophy Score */}
          <motion.div
            variants={floatBadgeVariants(0.8)}
            initial="hidden"
            animate="visible"
            className="absolute -top-6 -left-6 sm:-left-8 bg-slate-900/95 border border-cyan-500/40 p-3 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Hypertrophy Index</span>
              <span className="text-xs font-bold text-white">98.4% Optimal</span>
            </div>
          </motion.div>

          {/* Floating Badge 2: CNS Cortisol Level */}
          <motion.div
            variants={floatBadgeVariants(1.0)}
            initial="hidden"
            animate="visible"
            className="absolute -bottom-6 -right-4 sm:-right-6 bg-slate-900/95 border border-emerald-500/40 p-3 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🩸
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">CNS Stress Tax</span>
              <span className="text-xs font-bold text-emerald-400">Controlled (Low)</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
