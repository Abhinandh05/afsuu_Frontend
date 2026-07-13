"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import DashboardShell from "../../../components/DashboardShell";
import { runAgent, getToken, ApiError } from "../../../lib/api";
import "highlight.js/styles/github-dark.css";

/**
 * Manager Agent — flagship multi-agent orchestration UI (Day 16).
 * Shows plan → per-step results → combined final response.
 */
export default function ManagerAgentPage() {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [stepResults, setStepResults] = useState(null);
  const [finalResponse, setFinalResponse] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [openSteps, setOpenSteps] = useState({});

  const trimmed = request.trim();
  const canSubmit = trimmed.length >= 3 && trimmed.length <= 8000 && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);
    setPlan(null);
    setStepResults(null);
    setFinalResponse(null);
    setTaskId(null);
    setOpenSteps({});

    try {
      const data = await runAgent(
        "/api/v1/agents/manager",
        { request: trimmed },
        token
      );
      setPlan(data.plan || []);
      setStepResults(data.step_results || []);
      setFinalResponse(data.final_response || "");
      setTaskId(data.task_id ?? null);
      // Expand first step by default
      if ((data.step_results || []).length > 0) {
        setOpenSteps({ 0: true });
      }
    } catch (err) {
      if (err instanceof ApiError && (err.code === "unauthorized" || err.status === 401)) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      setError(err.message || "Manager orchestration failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleStep(index) {
    setOpenSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  const agentLabel = (name) =>
    ({
      research: "Research",
      finance: "Finance",
      analytics: "Analytics",
      coding: "Coding",
      email: "Email",
      ppt: "PPT",
    }[name] || name);

  const statusColor = (status) => {
    if (status === "completed") return "text-green-400";
    if (status === "failed") return "text-red-400";
    if (status === "skipped") return "text-amber-400";
    return "text-zinc-400";
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Flagship · Multi-Agent
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Manager Agent
          </h1>
          <p className="mt-2 text-zinc-400">
            Submit one complex request. The Manager plans which specialists to
            use (Research, Finance, Analytics, Coding, Email), runs them in
            order, and combines their outputs into a single answer. Expect{" "}
            <span className="text-zinc-300">30 seconds to 2+ minutes</span>{" "}
            depending on how many steps the plan includes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm font-medium text-zinc-300">
            Complex business request
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={7}
              maxLength={8000}
              placeholder={
                "e.g. Research the current EV battery market, analyze whether it's a good time to invest using financial reasoning, and draft a short summary email of the findings"
              }
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-500">
              {trimmed.length}/8000 · min 3 characters
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Orchestrating specialists…" : "Run Manager"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="rounded-xl border border-blue-900/50 bg-blue-950/30 px-4 py-3 text-sm text-blue-200">
            Planning and running specialist agents. This can take a while —
            please keep this tab open.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {finalResponse && (
          <section className="rounded-2xl border border-blue-800/60 bg-gradient-to-br from-[#12182a] to-[#0d111a] p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-blue-100">
                Final response
              </h2>
              {taskId != null && (
                <span className="text-xs text-zinc-500">Task #{taskId}</span>
              )}
            </div>
            <div className="prose prose-invert max-w-none prose-p:text-zinc-200 prose-li:text-zinc-200">
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {finalResponse}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {plan && plan.length > 0 && (
          <section className="rounded-2xl border border-zinc-800 bg-[#11141d] p-5">
            <h2 className="text-lg font-semibold text-zinc-100">Plan</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Steps the Manager decided to run (in order).
            </p>
            <ol className="mt-4 space-y-3">
              {plan.map((step, i) => (
                <li
                  key={`${step.agent}-${i}`}
                  className="flex gap-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-950 text-xs font-bold text-blue-300">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-blue-300">
                      {agentLabel(step.agent)}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-300">{step.subtask}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {stepResults && stepResults.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-100">
              Step results
            </h2>
            {stepResults.map((step, i) => {
              const open = Boolean(openSteps[i]);
              return (
                <div
                  key={`${step.agent}-result-${i}`}
                  className="overflow-hidden rounded-xl border border-zinc-800 bg-[#11141d]"
                >
                  <button
                    type="button"
                    onClick={() => toggleStep(i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-900/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-xs font-mono text-zinc-500">
                        #{i + 1}
                      </span>
                      <span className="truncate text-sm font-medium text-zinc-100">
                        {agentLabel(step.agent)}
                      </span>
                      <span
                        className={`text-xs font-medium uppercase ${statusColor(
                          step.status
                        )}`}
                      >
                        {step.status}
                      </span>
                    </div>
                    <span className="shrink-0 text-zinc-500">
                      {open ? "▾" : "▸"}
                    </span>
                  </button>
                  {open && (
                    <div className="border-t border-zinc-800 px-4 py-3">
                      <p className="mb-2 text-xs text-zinc-500">
                        Subtask: {step.subtask}
                      </p>
                      <div className="prose prose-invert max-w-none prose-sm prose-p:text-zinc-300">
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                          {step.output || ""}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
