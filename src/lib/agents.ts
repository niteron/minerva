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
    id: 'assessment',
    name: 'Nova',
    description: 'Guides users through issue assessment with deep follow-up questions, risk spotting, and practical preparation steps.',
    subtitle: 'Assessment Specialist',
    initial: 'N',
    runtimeArn: defaultArn,
  }
];

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}
