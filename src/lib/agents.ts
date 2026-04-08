import outputs from '../../amplify_outputs.json';

export type Agent = {
  id: string;
  name: string;
  description: string;
  subtitle: string;
  initial: string;
  /** Bedrock Agent Core runtime ARN for this agent */
  runtimeArn: string;
  /** Preset key for the gradient avatar on agent cards */
  avatarColor?:
    | 'bg-blue-500'
    | 'bg-purple-500'
    | 'bg-emerald-500'
    | 'bg-amber-500';
  bio?: string;
  capabilities?: string[];
  comingSoon?: boolean;
  rating?: number;
  reviewCount?: number;
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
    avatarColor: 'bg-purple-500',
    bio: 'Clarifies every angle before you commit.',
    capabilities: ['Deep follow-ups', 'Risk spotting', 'Prep steps'],
    rating: 4.9,
    reviewCount: 128,
  },
];

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}
