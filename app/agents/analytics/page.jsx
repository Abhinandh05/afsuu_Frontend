"use client";

import AgentChat from "../../../components/AgentChat";
import DashboardShell from "../../../components/DashboardShell";

export default function AnalyticsAgentPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Agent</h1>
          <p className="mt-2 text-zinc-400">
            Ask about trends, churn risk, sales forecasts, or customer
            segments — powered by Groq plus trained ML models (including
            unsupervised K-Means segmentation).
          </p>
        </div>

        <AgentChat
          agentName="Analytics"
          endpoint="/api/v1/agents/analytics"
          placeholder="e.g. Segment a customer age 28, income 75, spending 80 — or forecast West Technology sales..."
          inputLabel="Request"
          payloadKey="request"
        />

        <p className="text-xs text-zinc-500">
          Follow-up: standalone quick widgets for{" "}
          <code className="text-zinc-400">/api/v1/ml/churn</code>,{" "}
          <code className="text-zinc-400">/api/v1/ml/sales-forecast</code>, and{" "}
          <code className="text-zinc-400">/api/v1/ml/customer-segment</code>{" "}
          (LLM-free) can be added under this chat.
        </p>
      </div>
    </DashboardShell>
  );
}
