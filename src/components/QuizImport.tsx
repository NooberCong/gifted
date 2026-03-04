'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link, FileText, AlertCircle, Loader2, X, Copy, Check } from 'lucide-react';
import { parseGift, validateGiftContent } from '@/lib/gift-parser';
import { useQuizStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface QuizImportProps {
  onImportComplete?: () => void;
}

export function QuizImport({ onImportComplete }: QuizImportProps) {
  const [mode, setMode] = useState<'file' | 'url' | null>(null);
  const [url, setUrl] = useState('');
  const [quizName, setQuizName] = useState('');
  const [pendingFileContent, setPendingFileContent] = useState<string | null>(null);
  const [pendingFileBaseName, setPendingFileBaseName] = useState<string | null>(null);
  const [pendingFileSource, setPendingFileSource] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addQuiz = useQuizStore(state => state.addQuiz);

  const fetchGiftFromUrl = useCallback(async (targetUrl: string) => {
    const response = await fetch(`/api/import?url=${encodeURIComponent(targetUrl)}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || `Failed to fetch: ${response.status}`);
    }
    if (!data?.content || typeof data.content !== 'string') {
      throw new Error('Invalid response from import endpoint');
    }
    return data.content as string;
  }, []);

  // Handle URL query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fileUrl = params.get('file');
    const sharedName = params.get('name');
    if (fileUrl) {
      setUrl(fileUrl);
      setMode('url');
      if (sharedName) {
        setQuizName(sharedName);
      }
    }
  }, []);

  const processGiftContent = useCallback((content: string, source?: string, defaultQuizName?: string) => {
    const validation = validateGiftContent(content);
    if (!validation.valid) {
      setError(validation.error || 'Invalid GIFT format');
      return false;
    }

    try {
      const quiz = parseGift(content, quizName || defaultQuizName || 'Imported Quiz');
      quiz.source = source;
      addQuiz(quiz);
      setError(null);
      setQuizName('');
      setUrl('');
      setPendingFileContent(null);
      setPendingFileBaseName(null);
      setPendingFileSource(null);
      setMode(null);
      onImportComplete?.();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse quiz');
      return false;
    }
  }, [addQuiz, quizName, onImportComplete]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.gift')) {
      setError('Please select a .txt or .gift file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const baseName = file.name.replace(/\.(txt|gift)$/i, '');
      const validation = validateGiftContent(content);
      if (!validation.valid) {
        setError(validation.error || 'Invalid GIFT format');
        setPendingFileContent(null);
        setPendingFileBaseName(null);
        setPendingFileSource(null);
        return;
      }
      const fileWithPath = file as File & { path?: string };
      const sourcePath = fileWithPath.path || file.webkitRelativePath || file.name;
      setPendingFileContent(content);
      setPendingFileBaseName(baseName);
      setPendingFileSource(sourcePath);
    } catch {
      setError('Failed to read file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileImport = useCallback(() => {
    if (!pendingFileContent || !pendingFileBaseName || !pendingFileSource) {
      setError('Please select a file first');
      return;
    }
    processGiftContent(pendingFileContent, pendingFileSource, pendingFileBaseName);
  }, [pendingFileContent, pendingFileBaseName, pendingFileSource, processGiftContent]);

  const handleUrlImport = useCallback(async (importUrl?: string) => {
    const targetUrl = importUrl || url;
    if (!targetUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await fetchGiftFromUrl(targetUrl);
      const urlName = targetUrl.split('/').pop()?.replace(/\.(txt|gift)$/i, '') || 'URL Import';
      processGiftContent(content, targetUrl, urlName);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch URL');
    } finally {
      setIsLoading(false);
    }
  }, [url, processGiftContent, fetchGiftFromUrl]);

  const handleCopyShareLink = useCallback(async () => {
    const targetUrl = url.trim();
    if (!targetUrl) {
      setError('Please enter a URL first');
      return;
    }

    const params = new URLSearchParams();
    params.set('file', targetUrl);
    if (quizName.trim()) {
      params.set('name', quizName.trim());
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setError('Failed to copy share link');
    }
  }, [url, quizName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {!mode ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-center mb-8">Import Quiz</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('file')}
                className={cn(
                  "flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed",
                  "transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50",
                  "dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50"
                )}
              >
                <Upload className="w-10 h-10 mb-3 text-zinc-400" />
                <span className="font-medium">Upload File</span>
                <span className="text-sm text-zinc-500 mt-1">.txt or .gift</span>
              </button>

              <button
                onClick={() => setMode('url')}
                className={cn(
                  "flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed",
                  "transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50",
                  "dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50"
                )}
              >
                <Link className="w-10 h-10 mb-3 text-zinc-400" />
                <span className="font-medium">From URL</span>
                <span className="text-sm text-zinc-500 mt-1">Paste a link</span>
              </button>
            </div>
          </motion.div>
        ) : mode === 'file' ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Upload File</h2>
              <button
                onClick={() => {
                  setMode(null);
                  setError(null);
                  setPendingFileContent(null);
                  setPendingFileBaseName(null);
                  setPendingFileSource(null);
                }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed cursor-pointer",
                "transition-all duration-200",
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.gift"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              
              {isLoading ? (
                <Loader2 className="w-12 h-12 text-zinc-400 animate-spin" />
              ) : (
                <>
                  <FileText className="w-12 h-12 text-zinc-400 mb-4" />
                  <p className="text-lg font-medium">Drop your file here</p>
                  <p className="text-sm text-zinc-500 mt-1">or click to browse</p>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">
                Quiz Name (optional)
              </label>
              <input
                type="text"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                placeholder="Enter a name for this quiz"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-transparent",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  "dark:border-zinc-700"
                )}
              />
            </div>

            {pendingFileBaseName && (
              <p className="text-sm text-zinc-500">
                Selected file: <span className="font-medium text-zinc-700 dark:text-zinc-300">{pendingFileSource || pendingFileBaseName}</span>
              </p>
            )}

            <button
              onClick={handleFileImport}
              disabled={isLoading || !pendingFileContent}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-medium transition-all",
                "bg-zinc-900 text-white hover:bg-zinc-800",
                "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Preparing...
                </>
              ) : (
                'Import Quiz'
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Import from URL</h2>
              <button
                onClick={() => { setMode(null); setError(null); }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">
                GIFT File URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (shareCopied) setShareCopied(false);
                }}
                placeholder="https://example.com/quiz.gift"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-transparent",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  "dark:border-zinc-700"
                )}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  disabled={!url.trim()}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                    "border border-zinc-300 text-zinc-700 hover:bg-zinc-100",
                    "dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">
                Quiz Name (optional)
              </label>
              <input
                type="text"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                placeholder="Enter a name for this quiz"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-transparent",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  "dark:border-zinc-700"
                )}
              />
            </div>

            <button
              onClick={() => handleUrlImport()}
              disabled={isLoading || !url.trim()}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-medium transition-all",
                "bg-zinc-900 text-white hover:bg-zinc-800",
                "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Quiz'
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
