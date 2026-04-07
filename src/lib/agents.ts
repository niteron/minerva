import outputs from '../../amplify_outputs.json';

export type Agent = {
  id: string;
  name: string;
  description: string;
  subtitle: string;
  initial: string;
  /** Bedrock Agent Core runtime ARN for this agent */
  runtimeArn: string;
};

const defaultArn =
  (outputs as { custom?: { agentRuntimeArn?: string } }).custom?.agentRuntimeArn ?? '';

export const AGENTS: Agent[] = [
  {
    id: 'nova-japanese',
    name: 'Nova',
    description:
      'Japanese language tutor with real-time voice, corrections, and natural conversation.',
    subtitle: 'Japanese tutor',
    initial: 'N',
    runtimeArn: defaultArn,
  },
  {
    id: 'nova-practice',
    name: 'Nova Practice',
    description:
      'Extra speaking drills and repetition using the same voice runtime (demo listing).',
    subtitle: 'Conversation practice',
    initial: 'P',
    runtimeArn: defaultArn,
  },
];

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}
