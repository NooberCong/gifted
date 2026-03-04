'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { QuizImport, QuizList, QuizPlayer } from '@/components';
import { useQuizStore } from '@/lib/store';
import { cn } from '@/lib/utils';

function seededRandom(seed: number): number {
  let x = (seed ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 4_294_967_296;
}

export default function Home() {
  const currentQuizId = useQuizStore((state) => state.currentQuizId);
  const shootingStars = Array.from({ length: 2 }, (_, i) => {
    const ry = seededRandom(701 + i * 31);
    const rr = seededRandom(809 + i * 37);
    const ro = seededRandom(907 + i * 41);
    const rt = seededRandom(991 + i * 43);
    const width = 34 + rr * 16;
    const rotation = -(18 + rt * 12);
    const travelX = 110;
    const travelY = Math.tan((Math.abs(rotation) * Math.PI) / 180) * travelX;

    return {
      id: i,
      top: `${(8 + ry * 24).toFixed(3)}%`,
      width: `${width.toFixed(3)}px`,
      opacity: 0.78 + ro * 0.2,
      rotation,
      travelX: `${travelX.toFixed(3)}vw`,
      travelY: `${travelY.toFixed(3)}vw`,
      delay: i * 4.5,
    };
  });
  const stars = Array.from({ length: 38 }, (_, i) => {
    const r1 = seededRandom(i + 11);
    const r2 = seededRandom(i + 37);
    const r3 = seededRandom(i + 73);
    const r4 = seededRandom(i + 101);
    const r5 = seededRandom(i + 149);
    const r6 = seededRandom(i + 181);
    const r7 = seededRandom(i + 223);
    const r8 = seededRandom(i + 271);
    const r9 = seededRandom(i + 313);
    const p1x = 3 + r1 * 94;
    const p1y = 4 + r2 * 72;
    const p2x = 3 + r6 * 94;
    const p2y = 4 + r7 * 72;
    const p3x = 3 + r8 * 94;
    const p3y = 4 + r9 * 72;

    return {
      id: i,
      p1x: `${p1x.toFixed(4)}%`,
      p1y: `${p1y.toFixed(4)}%`,
      p2x: `${p2x.toFixed(4)}%`,
      p2y: `${p2y.toFixed(4)}%`,
      p3x: `${p3x.toFixed(4)}%`,
      p3y: `${p3y.toFixed(4)}%`,
      size: `${(3 + r3 * 4.5).toFixed(4)}px`,
      duration: 5 + r4 * 6,
      delay: -r5 * 7,
      glow: r4 > 0.55,
    };
  });

  return (
    <>
      <AnimatePresence>
        {currentQuizId && <QuizPlayer />}
      </AnimatePresence>

      <div className="min-h-screen relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Moon integrated with top glow */}
          <motion.div
            className="absolute top-6 right-6 lg:right-auto lg:left-10 w-16 h-16 rounded-full bg-zinc-100/95 dark:bg-zinc-100/90 shadow-[0_0_36px_8px_rgba(244,244,245,0.35)]"
            animate={{
              scale: [1, 1.05, 0.98, 1],
              opacity: [0.9, 1, 0.86, 0.9],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Atmosphere blobs */}
          <motion.div
            className="absolute -top-24 -right-28 sm:right-auto sm:-left-28 w-84 h-84 rounded-full bg-blue-300/18 dark:bg-blue-500/12 blur-3xl"
            animate={{ x: [0, 40, -20, 0], y: [0, 20, -10, 0], scale: [1, 1.08, 0.96, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute -bottom-44 -left-36 lg:left-auto lg:-right-36 w-[32rem] h-[32rem]">
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-300/15 dark:bg-emerald-500/10 blur-3xl"
              animate={{ x: [0, -35, 20, 0], y: [0, -25, 10, 0], scale: [1, 0.94, 1.06, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 w-56 h-56 sm:w-64 sm:h-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-100/35 dark:border-emerald-200/20 shadow-[0_0_50px_rgba(16,185,129,0.6)] overflow-hidden"
              animate={{
                y: [0, -5.5, 0],
              }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.img
                src="/earth.png"
                alt="Earth"
                className="absolute inset-0 w-full h-full object-cover blur-[0.6px] brightness-90 saturate-90"
                animate={{ scale: [1, 1.025, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.span
                className="absolute inset-0 opacity-45 mix-blend-screen"
                style={{
                  background:
                    'radial-gradient(52% 44% at 24% 22%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.14) 54%, transparent 72%)',
                  filter: 'blur(1.2px)',
                }}
                animate={{ x: ['-2%', '4%', '-2%'], y: ['0%', '1.5%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="absolute -inset-[10%] rounded-full border border-emerald-200/20 blur-[1.2px]" />
              <span className="absolute inset-0 rounded-full shadow-[inset_-12px_-14px_24px_rgba(8,47,73,0.26),inset_9px_11px_18px_rgba(255,255,255,0.2)]" />
            </motion.div>
          </div>

          {/* Shooting stars */}
          {shootingStars.map((shootingStar) => (
            <motion.div
              key={shootingStar.id}
              className="absolute -right-24 h-px bg-gradient-to-r from-zinc-100/95 via-zinc-100/70 to-transparent dark:from-zinc-100/90 dark:via-zinc-100/65 shadow-[0_0_10px_rgba(255,255,255,0.6)]"
              style={{
                top: shootingStar.top,
                width: shootingStar.width,
                rotate: `${shootingStar.rotation.toFixed(3)}deg`,
              }}
              animate={{
                x: [
                  '0vw',
                  `-${(Number.parseFloat(shootingStar.travelX) * 0.2).toFixed(3)}vw`,
                  `-${(Number.parseFloat(shootingStar.travelX) * 0.55).toFixed(3)}vw`,
                  `-${(Number.parseFloat(shootingStar.travelX) * 0.9).toFixed(3)}vw`,
                  `-${shootingStar.travelX}`,
                ],
                y: [
                  '0vw',
                  `${(Number.parseFloat(shootingStar.travelY) * 0.2).toFixed(3)}vw`,
                  `${(Number.parseFloat(shootingStar.travelY) * 0.55).toFixed(3)}vw`,
                  `${(Number.parseFloat(shootingStar.travelY) * 0.9).toFixed(3)}vw`,
                  shootingStar.travelY,
                ],
                opacity: [0, shootingStar.opacity, shootingStar.opacity, shootingStar.opacity, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatDelay: 4,
                delay: shootingStar.delay,
                ease: 'linear',
                times: [0, 0.08, 0.4, 0.78, 1],
              }}
            />
          ))}

          {/* Stars: shine, dim, disappear, reappear */}
          {stars.map((star) => (
            <motion.span
              key={star.id}
              className={cn(
                "absolute bg-zinc-200/85 dark:bg-zinc-100/85 [clip-path:polygon(50%_0%,62%_38%,100%_50%,62%_62%,50%_100%,38%_62%,0%_50%,38%_38%)]",
                star.glow && "shadow-[0_0_10px_rgba(255,255,255,0.75)]"
              )}
              style={{
                left: star.p1x,
                top: star.p1y,
                width: star.size,
                height: star.size,
              }}
              animate={{
                opacity: [0.08, 1, 0.25, 0.08],
                scale: [0.78, 1.3, 0.9, 0.78],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Header */}
        <header className="relative z-10">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Gifted</h1>
                  <p className="text-sm text-zinc-500">Interactive Quiz Platform</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          <QuizImport />
          <QuizList />
          
          {/* Info Section */}
          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold mb-4 text-zinc-600 dark:text-zinc-400">
              About GIFT Format
            </h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
              GIFT (General Import Format Template) is a simple text format for creating quiz questions.
              It supports multiple choice, true/false, short answer, matching, numerical, and essay questions.
            </p>
            <div className="inline-block p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-left">
              <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
{`// Example GIFT format:
::Capital of France::
What is the capital of France?
{=Paris ~London ~Berlin ~Madrid}

The Earth is flat. {FALSE}`}
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-auto">
          <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-zinc-500">
            <p>
              Import a quiz via file upload, URL, or use query params{' '}
              <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">?file=URL</code>
              {' '}and optional{' '}
              <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">&name=QUIZ_NAME</code>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
