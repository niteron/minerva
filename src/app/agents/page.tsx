'use client';

import { AGENTS } from '@/lib/agents';
import { AgentCard } from '@/components/agent-card';

export default function AgentsPage() {
  return (
    <ul className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
      {AGENTS.map((agent) => (
        <li key={agent.id} className="flex min-h-0">
          <AgentCard agent={agent} />
        </li>
      ))}
    </ul>
  );
}
