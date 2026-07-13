"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import DashboardShell from "../../components/DashboardShell";
import { API_BASE, ApiError, getToken, runAgent } from "../../lib/api";
import { formatRelativeTime } from "../../lib/time";
import "highlight.js/styles/github-dark.css";

const PAGE_SIZE = 20;

const AGENT_OPTIONS = [
  { value: "", label: "All agents" },
  { value: "research", label: "Research" },
  { value: "finance", label: "Finance" },
  { value: "analytics", label: "Analytics" },
  { value: "coding", label: "Coding" },
  { value: "email", label: "Email" },
  { value: "ppt", label: "PPT" },
  { value: "manager", label: "Manager" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

const AGENT_BADGE = {
  research: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  finance: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  analytics: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  coding: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  email: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  ppt: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  manager: "bg-blue-500/15 text-blue-300 border-blue-500/30",
};

const STATUS_BADGE = {
  pending: "bg-zinc-600/40 text-zinc-200 border-zinc-500/40",
  running: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  failed: "bg-red-500/20 text-red-300 border-red-500/30",
};

function buildListUrl({ agentType, status, offset }) {
  const params = new URLSearchParams();
  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(offset));
  if (agentType) params.set("agent_type", agentType);
  if (status) params.set("status", status);
  return `/api/v1/tasks?${params.toString()}`;
}

export default function TaskHistoryPage() {
  const router = useRouter();
  const [agentType, setAgentType] = useState("");
  const [status, setStatus] = useState("");
  const [tasks, setTasks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const authRedirect = useCallback(() => {
    localStorage.removeItem("token");
    router.replace("/login");
  }, [router]);

  const loadTasks = useCallback(
    async ({ nextOffset = 0, append = false } = {}) => {
      const token = getToken();
      if (!token) {
        authRedirect();
        return;
      }
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const data = await runAgent(
          buildListUrl({ agentType, status, offset: nextOffset }),
          null,
          token,
          "GET"
        );
        const rows = data?.tasks || [];
        setTotalCount(data?.total_count ?? rows.length);
        setTasks((prev) => (append ? [...prev, ...rows] : rows));
        setOffset(nextOffset);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          authRedirect();
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load tasks");
        if (!append) setTasks([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [agentType, status, authRedirect]
  );

  useEffect(() => {
    loadTasks({ nextOffset: 0, append: false });
  }, [loadTasks]);

  const openDetail = async (taskId) => {
    setSelectedId(taskId);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    const token = getToken();
    if (!token) {
      authRedirect();
      return;
    }
    try {
      const data = await runAgent(`/api/v1/tasks/${taskId}`, null, token, "GET");
      setDetail(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        authRedirect();
        return;
      }
      setDetailError(
        err instanceof ApiError ? err.message : "Failed to load task detail"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
  };

  const handleDelete = async () => {
    if (!selectedId || deleting) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    const token = getToken();
    if (!token) {
      authRedirect();
      return;
    }
    setDeleting(true);
    try {
      await runAgent(`/api/v1/tasks/${selectedId}`, null, token, "DELETE");
      closeDetail();
      await loadTasks({ nextOffset: 0, append: false });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        authRedirect();
        return;
      }
      setDetailError(
        err instanceof ApiError ? err.message : "Failed to delete task"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedId) return;
    const token = getToken();
    if (!token) {
      authRedirect();
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/tasks/${selectedId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        authRedirect();
        return;
      }
      if (!res.ok) {
        setDetailError("Download failed — file may be missing.");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `task-${selectedId}-file`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDetailError("Download failed. Please try again.");
    }
  };

  const hasMore = tasks.length < totalCount;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task History</h1>
          <p className="mt-2 text-zinc-400">
            Browse past agent runs — filter, inspect results, or delete records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex flex-col gap-1 text-sm text-zinc-400 flex-1">
            Agent type
            <select
              value={agentType}
              onChange={(e) => setAgentType(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-[#11141d] px-3 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AGENT_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-400 flex-1">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-[#11141d] px-3 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all-status"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-[#11141d] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Prompt</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-zinc-400">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        Loading tasks…
                      </span>
                    </td>
                  </tr>
                )}
                {!loading && tasks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-zinc-500">
                      No tasks found. Run an agent to create history.
                    </td>
                  </tr>
                )}
                {!loading &&
                  tasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => openDetail(task.id)}
                      className="cursor-pointer hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium capitalize ${
                            AGENT_BADGE[task.agent_type] ||
                            "bg-zinc-700/40 text-zinc-300 border-zinc-600/40"
                          }`}
                        >
                          {task.agent_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-200 max-w-md truncate">
                        {task.prompt}
                        {task.has_file ? (
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-400">
                            file
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium capitalize ${
                            STATUS_BADGE[task.status] ||
                            "bg-zinc-700/40 text-zinc-300 border-zinc-600/40"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                        {formatRelativeTime(task.created_at)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && hasMore && (
            <div className="border-t border-zinc-800 p-4 flex justify-center">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() =>
                  loadTasks({ nextOffset: offset + PAGE_SIZE, append: true })
                }
                className="rounded-xl bg-zinc-800 px-5 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-zinc-500">
          Showing {tasks.length} of {totalCount} task{totalCount === 1 ? "" : "s"}
        </p>
      </div>

      {selectedId !== null && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close detail panel"
            className="flex-1 cursor-default"
            onClick={closeDetail}
          />
          <aside className="w-full max-w-xl h-full bg-[#11141d] border-l border-zinc-800 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold">Task #{selectedId}</h2>
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {detailLoading && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  Loading detail…
                </div>
              )}
              {detailError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {detailError}
                </div>
              )}
              {detail && !detailLoading && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium capitalize ${
                        AGENT_BADGE[detail.agent_type] ||
                        "bg-zinc-700/40 text-zinc-300 border-zinc-600/40"
                      }`}
                    >
                      {detail.agent_type}
                    </span>
                    <span
                      className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_BADGE[detail.status] ||
                        "bg-zinc-700/40 text-zinc-300 border-zinc-600/40"
                      }`}
                    >
                      {detail.status}
                    </span>
                    <span className="text-xs text-zinc-500 self-center">
                      {formatRelativeTime(detail.created_at)}
                    </span>
                  </div>

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Prompt
                    </h3>
                    <p className="text-sm text-zinc-200 whitespace-pre-wrap">
                      {detail.prompt}
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Result
                    </h3>
                    {detail.result ? (
                      <div className="prose prose-invert prose-sm max-w-none text-zinc-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_p]:my-2 [&_strong]:text-white [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#0d1117] [&_pre]:p-4 [&_code]:font-mono [&_code]:text-sm">
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                          {detail.result}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">No result yet.</p>
                    )}
                  </section>

                  {detail.plan_details ? (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Plan details
                      </h3>
                      <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-4 text-xs text-zinc-300 font-mono whitespace-pre-wrap">
                        {(() => {
                          try {
                            return JSON.stringify(
                              JSON.parse(detail.plan_details),
                              null,
                              2
                            );
                          } catch {
                            return detail.plan_details;
                          }
                        })()}
                      </pre>
                    </section>
                  ) : null}
                </>
              )}
            </div>

            <div className="border-t border-zinc-800 px-5 py-4 flex flex-wrap gap-3">
              {detail?.has_file ? (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Download file
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </aside>
        </div>
      )}
    </DashboardShell>
  );
}
