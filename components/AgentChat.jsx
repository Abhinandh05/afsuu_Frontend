"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { runAgent, getToken, ApiError } from "../lib/api";
import "highlight.js/styles/github-dark.css";

/**
 * Reusable agent chat UI for Research / Finance / Analytics / Coding / Email agents.
 * Task history UI comes on Day 17.
 */
export default function AgentChat({
  agentName,
  endpoint,
  placeholder = "Enter your topic or task…",
  inputLabel = "Topic",
  payloadKey = "topic",
  maxChars = 500,
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const trimmed = input.trim();
  const canSubmit = !loading && trimmed.length >= 3 && trimmed.length <= maxChars;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await runAgent(endpoint, { [payloadKey]: trimmed }, token);
      setResult(data?.result ?? "");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="agent-input"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            {inputLabel}
          </label>
          <textarea
            id="agent-input"
            rows={5}
            maxLength={maxChars}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="w-full rounded-xl border border-zinc-700 bg-[#11141d] px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-y"
          />
          <div className="mt-1 flex justify-between text-xs text-zinc-500">
            <span>Min 3 characters</span>
            <span>
              {input.length}/{maxChars}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Running…" : `Run ${agentName}`}
        </button>
      </form>

      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#11141d] px-4 py-4 text-zinc-300">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm">
            Working… this can take up to a couple of minutes
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 space-y-3">
          <p className="text-sm text-red-300">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-sm font-medium text-red-200 underline hover:text-white"
          >
            Try again
          </button>
        </div>
      )}

      {result !== null && !loading && !error && (
        <div className="rounded-xl border border-zinc-800 bg-[#11141d] px-5 py-5">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Result
          </h3>
          <div className="prose prose-invert prose-sm max-w-none text-zinc-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_p]:my-2 [&_strong]:text-white [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#0d1117] [&_pre]:p-4 [&_code]:font-mono [&_code]:text-sm">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
