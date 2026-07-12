"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AgentChat from "../../../components/AgentChat";

export default function ResearchAgentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0e14]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <header className="border-b border-zinc-800 bg-[#11141d]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            ← Back to dashboard
          </Link>
          <span className="text-sm font-medium text-zinc-300">AI Business OS</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Agent</h1>
          <p className="mt-2 text-zinc-400">
            Ask the Research Agent to find and summarize information on any business topic.
          </p>
        </div>

        <AgentChat
          agentName="Research"
          endpoint="/api/v1/agents/research"
          placeholder="e.g. Latest trends in AI for small businesses in 2026"
          inputLabel="Topic"
          payloadKey="topic"
        />
      </main>
    </div>
  );
}
