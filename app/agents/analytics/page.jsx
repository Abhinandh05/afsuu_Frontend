"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AgentChat from "../../../components/AgentChat";

export default function AnalyticsAgentPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Analytics Agent</h1>
          <p className="mt-2 text-zinc-400">
            Ask about trends, churn risk, or sales forecasts — powered by Groq
            plus trained churn and sales ML models.
          </p>
        </div>

        <AgentChat
          agentName="Analytics"
          endpoint="/api/v1/agents/analytics"
          placeholder="e.g. Forecast Technology sales in the West for November, or assess churn for a month-to-month customer..."
          inputLabel="Request"
          payloadKey="request"
        />

        <p className="text-xs text-zinc-500">
          Follow-up: standalone quick widgets for{" "}
          <code className="text-zinc-400">/api/v1/ml/churn</code> and{" "}
          <code className="text-zinc-400">/api/v1/ml/sales-forecast</code>{" "}
          (LLM-free) can be added under this chat.
        </p>
      </main>
    </div>
  );
}
