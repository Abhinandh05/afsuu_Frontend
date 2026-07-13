"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../../../components/DashboardShell";
import { runAgent, getToken, ApiError } from "../../../lib/api";

/**
 * Email Agent UI — draft via LLM, review tone, edit, optionally send.
 * Sentiment is advisory only; Send is never disabled by tone.
 */
export default function EmailAgentPage() {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);

  const trimmedBrief = brief.trim();
  const canDraft = trimmedBrief.length >= 3 && !loading;

  async function handleDraft(e) {
    e.preventDefault();
    setError(null);
    setSendMessage(null);

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const data = await runAgent(
        "/api/v1/agents/email",
        { request: trimmedBrief },
        token
      );
      setSubject(data.subject || "");
      setBody(data.body || "");
      setSentiment(data.sentiment ?? null);
      setHasDraft(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === "unauthorized") {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      setError(err.message || "Failed to draft email");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    setError(null);
    setSendMessage(null);

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setSending(true);
    try {
      const data = await runAgent(
        "/api/v1/agents/email/send",
        { to: to.trim(), subject: subject.trim(), body },
        token
      );
      setSendMessage(`Email sent to ${data.to || to.trim()}.`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "unauthorized") {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      setError(err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  const confidencePct =
    sentiment && typeof sentiment.confidence === "number"
      ? Math.round(sentiment.confidence * 100)
      : null;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Agent</h1>
          <p className="mt-2 text-zinc-400">
            Describe the email you need. The agent drafts a subject and body,
            then a local HuggingFace model checks tone before you send.
            Tone analysis is advisory only — it never blocks sending.
          </p>
        </div>

        <form onSubmit={handleDraft} className="space-y-3">
          <label className="block text-sm font-medium text-zinc-300">
            What should the email say?
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="e.g. Thank our client for renewing their annual contract and offer a brief call next week…"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={!canDraft}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Drafting…" : "Draft email"}
          </button>
        </form>

        {error && (
          <div className="rounded-lg border border-red-800/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {sendMessage && (
          <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
            {sendMessage}
          </div>
        )}

        {hasDraft && (
          <div className="space-y-4">
            {sentiment?.tone_warning ? (
              <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
                {sentiment.tone_warning}
              </div>
            ) : sentiment ? (
              <div className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-900/50 px-2.5 py-1 text-xs text-zinc-400">
                Tone:{" "}
                <span className="ml-1 capitalize text-zinc-200">
                  {String(sentiment.label || "").toLowerCase()}
                </span>
                {confidencePct != null && (
                  <span className="ml-1 text-zinc-500">({confidencePct}%)</span>
                )}
                {sentiment.truncated && (
                  <span className="ml-2 text-zinc-500">
                    · checked first portion only
                  </span>
                )}
              </div>
            ) : null}

            <form onSubmit={handleSend} className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">
                To
                <input
                  type="email"
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@company.com"
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-300">
                Subject
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-300">
                Body
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 font-mono text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={sending || !to.trim() || !subject.trim() || !body.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send"}
              </button>
              <p className="text-xs text-zinc-500">
                Requires SENDGRID_API_KEY and SENDGRID_FROM_EMAIL on the backend.
                Sentiment never disables this button.
              </p>
            </form>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
