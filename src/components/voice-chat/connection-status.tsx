import type { ConnectionStatus as Status } from './types.ts';

const statusConfig = {
  disconnected: { label: 'Disconnected', color: 'bg-gray-300' },
  connecting: { label: 'Connecting…', color: 'bg-amber-400 animate-pulse' },
  connected: { label: 'Connected', color: 'bg-emerald-500' },
} as const;

export function ConnectionStatus({ status }: { status: Status }) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
      <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
      {config.label}
    </div>
  );
}
