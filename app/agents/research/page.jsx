"use client";

import AgentChat from "../../../components/AgentChat";
import DashboardShell from "../../../components/DashboardShell";

export default function ResearchAgentPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
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
      </div>
    </DashboardShell>
  );
}
