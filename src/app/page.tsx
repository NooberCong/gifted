'use client';

import type { CSSProperties } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
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

const SHOOTING_STARS = Array.from({ length: 2 }, (_, i) => {
  const ry = seededRandom(701 + i * 31);
  const rr = seededRandom(809 + i * 37);
  const ro = seededRandom(907 + i * 41);
  const rt = seededRandom(991 + i * 43);
  const width = 34 + rr * 16;
  const rotation = -(18 + rt * 12);
  const travelX = 110;

  return {
    id: i,
    top: `${(8 + ry * 24).toFixed(3)}%`,
    width: `${width.toFixed(3)}px`,
    opacity: (0.78 + ro * 0.2).toFixed(3),
    rotation: `${rotation.toFixed(3)}deg`,
    travelX: `-${travelX.toFixed(3)}vw`,
    delay: `${(i * 4.5).toFixed(3)}s`,
  };
});

const STARS = Array.from({ length: 38 }, (_, i) => {
  const r1 = seededRandom(i + 11);
  const r2 = seededRandom(i + 37);
  const r3 = seededRandom(i + 73);
  const r4 = seededRandom(i + 101);
  const r5 = seededRandom(i + 149);

  return {
    id: i,
    left: `${(3 + r1 * 94).toFixed(4)}%`,
    top: `${(4 + r2 * 72).toFixed(4)}%`,
    size: `${(3 + r3 * 4.5).toFixed(4)}px`,
    duration: `${(5 + r4 * 6).toFixed(3)}s`,
    delay: `${(-r5 * 7).toFixed(3)}s`,
    glow: r4 > 0.55,
  };
});

export default function Home() {
  const currentQuizId = useQuizStore((state) => state.currentQuizId);
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <AnimatePresence>
        {currentQuizId && <QuizPlayer />}
      </AnimatePresence>

      <div className="min-h-screen relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Moon integrated with top glow */}
          <div
            className={cn(
              "absolute top-6 right-6 lg:right-auto lg:left-10 w-16 h-16 rounded-full bg-zinc-100/95 dark:bg-zinc-100/90 shadow-[0_0_36px_8px_rgba(244,244,245,0.35)]",
              !prefersReducedMotion && "ambient-moon"
            )}
          />

          {/* Atmosphere blobs */}
          <div
            className={cn(
              "absolute -top-24 -right-28 sm:right-auto sm:-left-28 w-84 h-84 rounded-full bg-blue-300/18 dark:bg-blue-500/12 blur-3xl will-change-transform",
              !prefersReducedMotion && "ambient-blob ambient-blob-blue"
            )}
          />
          <div className="absolute -bottom-44 -left-36 lg:left-auto lg:-right-36 w-[32rem] h-[32rem]">
            <div
              className={cn(
                "absolute inset-0 rounded-full bg-emerald-300/15 dark:bg-emerald-500/10 blur-3xl will-change-transform",
                !prefersReducedMotion && "ambient-blob ambient-blob-emerald"
              )}
            />
            <div
              className="absolute left-1/2 top-1/2 w-56 h-56 sm:w-64 sm:h-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-100/35 dark:border-emerald-200/20 shadow-[0_0_50px_rgba(16,185,129,0.6)] overflow-hidden"
            >
                <div
                  className={cn(
                    "absolute inset-0 will-change-transform",
                    !prefersReducedMotion && "ambient-earth"
                  )}
                >
                  <Image
                    src="/earth.png"
                    alt="Earth"
                    fill
                    sizes="(max-width: 640px) 224px, 256px"
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover blur-[0.6px] brightness-90 saturate-90 will-change-transform",
                      !prefersReducedMotion && "ambient-earth-image"
                    )}
                    priority={false}
                  />
                  <span
                    className={cn(
                      "absolute inset-0 opacity-45 mix-blend-screen will-change-transform",
                      !prefersReducedMotion && "ambient-earth-highlight"
                    )}
                    style={{
                      background:
                        'radial-gradient(52% 44% at 24% 22%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.14) 54%, transparent 72%)',
                      filter: 'blur(1.2px)',
                    }}
                  />
              </div>
              <span className="absolute -inset-[10%] rounded-full border border-emerald-200/20 blur-[1.2px]" />
              <span className="absolute inset-0 rounded-full shadow-[inset_-12px_-14px_24px_rgba(8,47,73,0.26),inset_9px_11px_18px_rgba(255,255,255,0.2)]" />
            </div>
          </div>

          {/* Shooting stars */}
          {!prefersReducedMotion && SHOOTING_STARS.map((shootingStar) => (
            <div
              key={shootingStar.id}
              className="ambient-shooting-star absolute -right-24 h-px bg-gradient-to-r from-zinc-100/95 via-zinc-100/70 to-transparent dark:from-zinc-100/90 dark:via-zinc-100/65 shadow-[0_0_10px_rgba(255,255,255,0.6)] will-change-transform"
              style={{
                top: shootingStar.top,
                width: shootingStar.width,
                ['--shooting-star-x' as const]: shootingStar.travelX,
                ['--shooting-star-angle' as const]: shootingStar.rotation,
                ['--shooting-star-opacity' as const]: shootingStar.opacity,
                animationDelay: shootingStar.delay,
              } as CSSProperties}
            />
          ))}

          {/* Stars: shine, dim, disappear, reappear */}
          {STARS.map((star) => (
            <span
              key={star.id}
              className={cn(
                "absolute bg-zinc-200/85 dark:bg-zinc-100/85 [clip-path:polygon(50%_0%,62%_38%,100%_50%,62%_62%,50%_100%,38%_62%,0%_50%,38%_38%)] will-change-transform",
                !prefersReducedMotion && "ambient-star",
                star.glow && "shadow-[0_0_10px_rgba(255,255,255,0.75)]"
              )}
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDuration: star.duration,
                animationDelay: star.delay,
              } as CSSProperties}
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
