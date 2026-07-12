"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { API_BASE, ApiError, getToken, runAgent } from "../../lib/api";

const STATUS_STYLES = {
  uploaded: "bg-zinc-700 text-zinc-200",
  processing: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  indexed: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  failed: "bg-red-500/20 text-red-300 border border-red-500/30",
};

export default function DocumentsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [docs, setDocs] = useState([]);
  const [listError, setListError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [queryError, setQueryError] = useState(null);

  const authRedirect = useCallback(() => {
    localStorage.removeItem("token");
    router.replace("/login");
  }, [router]);

  const loadDocs = useCallback(async () => {
    const token = getToken();
    if (!token) {
      authRedirect();
      return;
    }
    try {
      const data = await runAgent("/api/v1/documents", null, token, "GET");
      setDocs(data?.documents || []);
      setListError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        authRedirect();
        return;
      }
      setListError(err instanceof ApiError ? err.message : "Failed to load documents");
    }
  }, [authRedirect]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
    loadDocs();
  }, [router, loadDocs]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getToken();
    if (!token) {
      authRedirect();
      return;
    }
    setUploading(true);
    setUploadMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/api/v1/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const body = await res.json().catch(() => null);
      if (res.status === 401) {
        authRedirect();
        return;
      }
      if (!res.ok || body?.success === false) {
        throw new ApiError(body?.error || body?.message || "Upload failed", {
          status: res.status,
        });
      }
      setUploadMsg(
        `Uploaded “${body.data.filename}” — status: ${body.data.status}. Indexing runs in the background.`
      );
      await loadDocs();
      // Refresh again shortly so indexed status can appear
      setTimeout(() => loadDocs(), 4000);
    } catch (err) {
      setUploadMsg(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 3 || asking) return;
    const token = getToken();
    if (!token) {
      authRedirect();
      return;
    }
    setAsking(true);
    setQueryError(null);
    setAnswer(null);
    setSources([]);
    try {
      const data = await runAgent(
        "/api/v1/documents/query",
        { question: q },
        token
      );
      setAnswer(data?.answer ?? "");
      setSources(data?.sources || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        authRedirect();
        return;
      }
      setQueryError(
        err instanceof ApiError ? err.message : "Query failed. Please try again."
      );
    } finally {
      setAsking(false);
    }
  };

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

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents & RAG</h1>
          <p className="mt-2 text-zinc-400">
            Upload files, wait until they are indexed, then ask questions grounded
            in your own documents.
          </p>
        </div>

        {/* Upload */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Upload</h2>
          <label className="flex flex-col gap-2 text-sm text-zinc-400">
            <span>Supported: .pdf, .docx, .xlsx, .csv, .txt (max 10MB)</span>
            <input
              type="file"
              accept=".pdf,.docx,.xlsx,.csv,.txt"
              disabled={uploading}
              onChange={handleUpload}
              className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
            />
          </label>
          {uploading && <p className="text-sm text-zinc-400">Uploading…</p>}
          {uploadMsg && <p className="text-sm text-zinc-300">{uploadMsg}</p>}
        </section>

        {/* List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your documents</h2>
            <button
              type="button"
              onClick={loadDocs}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Refresh
            </button>
          </div>
          {listError && <p className="text-sm text-red-300">{listError}</p>}
          {docs.length === 0 && !listError && (
            <p className="text-sm text-zinc-500">No documents yet.</p>
          )}
          <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-[#11141d]">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">{d.filename}</p>
                  <p className="text-xs text-zinc-500">
                    chunks: {d.chunk_count ?? 0}
                    {d.error_message ? ` · ${d.error_message}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                    STATUS_STYLES[d.status] || STATUS_STYLES.uploaded
                  }`}
                >
                  {d.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Query */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Ask your documents</h2>
          <form onSubmit={handleQuery} className="space-y-3">
            <textarea
              rows={4}
              maxLength={2000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What were the Q3 revenue highlights?"
              disabled={asking}
              className="w-full rounded-xl border border-zinc-700 bg-[#11141d] px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={asking || question.trim().length < 3}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {asking ? "Searching…" : "Ask"}
            </button>
          </form>

          {asking && (
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              Retrieving context and generating an answer…
            </div>
          )}

          {queryError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {queryError}
            </p>
          )}

          {answer !== null && !asking && !queryError && (
            <div className="space-y-4 rounded-xl border border-zinc-800 bg-[#11141d] px-5 py-5">
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                  Answer
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-zinc-200">
                  <ReactMarkdown>{answer}</ReactMarkdown>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                  Sources
                </h3>
                {sources.length === 0 ? (
                  <p className="text-sm text-zinc-500">No source chunks returned.</p>
                ) : (
                  <ul className="space-y-2">
                    {sources.map((s, i) => (
                      <li
                        key={`${s.filename}-${i}`}
                        className="rounded-lg border border-zinc-800 bg-[#0b0e14] px-3 py-2 text-sm"
                      >
                        <p className="font-medium text-blue-300">{s.filename}</p>
                        <p className="mt-1 text-zinc-400">{s.chunk_preview}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
