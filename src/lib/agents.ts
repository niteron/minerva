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
    id: 'legal-assessment',
    name: 'Nova Legal',
    description:
      'Guides users through legal issue assessment with deep follow-up questions, risk spotting, and practical preparation steps.',
    subtitle: 'Legal assessment agent',
    initial: 'N',
    runtimeArn: defaultArn,
  },
  {
    id: 'legal-intake',
    name: 'Nova Intake',
    description:
      'Runs structured legal intake: timeline capture, evidence checklist, and attorney-ready case summary.',
    subtitle: 'Legal intake specialist',
    initial: 'I',
    runtimeArn: defaultArn,
  },
];

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}
