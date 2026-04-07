import { notFound } from 'next/navigation';

import { getAgentById } from '@/lib/agents';
import { AgentCallPage } from '@/views/agent-call-page';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page(props: Props) {
  const { id } = await props.params;
  const agent = getAgentById(id);
  if (!agent) {
    notFound();
  }
  return <AgentCallPage agent={agent} />;
}
