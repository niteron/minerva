import { notFound } from 'next/navigation';

import { getAgentById } from '@/lib/agents';
import { AgentSessionGate } from '../../../components/agent-session-gate';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page(props: Props) {
  const { id } = await props.params;
  const agent = getAgentById(id);
  if (!agent) {
    notFound();
  }

  return (
    <AgentSessionGate
      runtimeArn={agent.runtimeArn}
      agentName={agent.name}
      agentSubtitle={agent.subtitle}
      agentInitial={agent.initial}
    />
  );
}
