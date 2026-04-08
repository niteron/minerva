import { notFound } from 'next/navigation';

import { getAgentById } from '@/lib/agents';
import { AgentSession } from '../../../components/agent-session';

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
    <AgentSession
      runtimeArn={agent.runtimeArn}
      agentName={agent.name}
      agentSubtitle={agent.subtitle}
      agentInitial={agent.initial}
    />
  );
}
