"use client";

import AgentChat from "../../../components/AgentChat";
import DashboardShell from "../../../components/DashboardShell";

export default function FinanceAgentPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Agent</h1>
          <p className="mt-2 text-zinc-400">
            Ask for financial analysis, ratios, investment memos — or credit risk
            scoring powered by a trained ML model.
          </p>
        </div>

        <AgentChat
          agentName="Finance"
          endpoint="/api/v1/agents/finance"
          placeholder="e.g. Assess loan for income 5000, credit history 1, loan amount 120..."
          inputLabel="Request"
          payloadKey="request"
        />
      </div>
    </DashboardShell>
  );
}
