"use client";

import AgentChat from "../../../components/AgentChat";
import DashboardShell from "../../../components/DashboardShell";

export default function CodingAgentPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coding Agent</h1>
          <p className="mt-2 text-zinc-400">
            Describe code to write or paste snippets to review/debug. The agent
            verifies results in a local beginner-safe Python sandbox (process
            isolation + timeout — not a production security boundary).
          </p>
        </div>

        <AgentChat
          agentName="Coding"
          endpoint="/api/v1/agents/coding"
          placeholder="Describe what code you need, or paste code to review/debug..."
          inputLabel="Request"
          payloadKey="request"
          maxChars={2000}
        />
      </div>
    </DashboardShell>
  );
}
