import type { ConnectionStatus as Status } from './types.ts';

const statusConfig = {
  disconnected: { label: 'Not in call', color: 'bg-slate-500' },
  connecting: { label: 'Calling…', color: 'bg-amber-400 animate-pulse' },
  connected: { label: 'In call', color: 'bg-emerald-400' },
} as const;

export function ConnectionStatus({ status }: { status: Status }) {
  const config = statusConfig[status];

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300"
      role="status"
    >
      <span className={`size-2 shrink-0 rounded-full ${config.color}`} />
      {config.label}
    </div>
  );
}
