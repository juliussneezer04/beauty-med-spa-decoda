"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm py-6 mt-auto">
      <div className="mx-auto max-w-7xl px-8 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Built with</span>
        <span className="text-red-500">❤️</span>
        <span>by</span>
        <Link
          href="https://vishnu.is-a.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity hover:underline"
        >
          Vishnu Sundaresan
        </Link>
        <span>for</span>
        <Link
          href="https://www.decodahealth.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-50 transition-opacity"
        >
          {/* Light mode icon - shown by default, hidden in dark mode */}
          <Image
            src="/decoda-bp.svg"
            alt="Decoda Health"
            width={99}
            height={18}
            className="h-4 w-auto block dark:hidden"
          />
          {/* Dark mode icon - hidden by default, shown in dark mode */}
          <Image
            src="/decoda-white.svg"
            alt="Decoda Health"
            width={99}
            height={18}
            className="h-4 w-auto hidden dark:block"
          />
        </Link>
      </div>
    </footer>
  );
}
