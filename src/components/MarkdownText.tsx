'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownTextProps {
  text: string;
  enabled?: boolean;
  inline?: boolean;
  className?: string;
}

export function MarkdownText({ text, enabled = false, inline = false, className }: MarkdownTextProps) {
  if (!enabled) {
    const Tag = inline ? 'span' : 'div';
    return <Tag className={cn(!inline && 'whitespace-pre-wrap', className)}>{text}</Tag>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) =>
          inline ? <span className={className}>{children}</span> : <p className={cn('mb-2 last:mb-0', className)}>{children}</p>,
        ul: ({ children }) => <ul className={cn('list-disc pl-5 space-y-1', className)}>{children}</ul>,
        ol: ({ children }) => <ol className={cn('list-decimal pl-5 space-y-1', className)}>{children}</ol>,
        blockquote: ({ children }) => (
          <blockquote className={cn('my-3 border-l-4 border-zinc-300 dark:border-zinc-600 pl-4 italic text-zinc-700 dark:text-zinc-300', className)}>
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-4 border-zinc-300 dark:border-zinc-700" />,
        table: ({ children }) => <table className="my-3 w-full border-collapse text-sm">{children}</table>,
        thead: ({ children }) => <thead className="bg-zinc-100 dark:bg-zinc-800">{children}</thead>,
        th: ({ children }) => <th className="border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-left">{children}</th>,
        td: ({ children }) => <td className="border border-zinc-300 dark:border-zinc-700 px-2 py-1">{children}</td>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 dark:text-blue-400 underline underline-offset-2 decoration-blue-500/70 hover:text-blue-800 dark:hover:text-blue-300"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[0.95em]">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="overflow-x-auto rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 text-sm">{children}</pre>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
