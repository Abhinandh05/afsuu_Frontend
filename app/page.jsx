import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-zinc-900 p-8">
      <main className="flex flex-col items-center justify-center text-center max-w-xl p-10 bg-white dark:bg-black shadow-2xl rounded-3xl">
        <div className="mb-8 p-4 rounded-full bg-blue-50 dark:bg-blue-900/20">
          <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
          AI Business OS
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md">
          Welcome to your AI-powered multi-agent business platform. Get started by logging into your account or creating a new one.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/login"
            className="flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:-translate-y-0.5"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center px-8 py-3.5 text-base font-semibold text-gray-900 transition-all duration-200 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:border-zinc-600 hover:-translate-y-0.5"
          >
            Create Account
          </Link>
        </div>
      </main>
    </div>
  );
}
