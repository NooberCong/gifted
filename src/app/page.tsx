'use client';

import { AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { QuizImport, QuizList, QuizPlayer } from '@/components';
import { useQuizStore } from '@/lib/store';

export default function Home() {
  const currentQuizId = useQuizStore((state) => state.currentQuizId);

  return (
    <>
      <AnimatePresence>
        {currentQuizId && <QuizPlayer />}
      </AnimatePresence>

      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-zinc-200 dark:border-zinc-800">
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
        <main className="max-w-4xl mx-auto px-6 py-12">
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
        <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
          <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-zinc-500">
            <p>Import a quiz via file upload, URL, or use <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">?file=URL</code> query parameter</p>
          </div>
        </footer>
      </div>
    </>
  );
}
