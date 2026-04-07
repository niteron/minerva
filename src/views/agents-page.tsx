'use client';

import Link from 'next/link';

import { AGENTS } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function AgentsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Legal agents</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Choose a legal workflow and launch a voice session. Each card opens a focused legal assessment call.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {AGENTS.map((agent) => (
          <li key={agent.id}>
            <Card className="border-white/10 bg-slate-900/80 text-slate-50 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-lg font-semibold text-white shadow-lg"
                    aria-hidden
                  >
                    {agent.initial}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-lg text-white">{agent.name}</CardTitle>
                    <p className="text-slate-500 text-xs">{agent.subtitle}</p>
                  </div>
                </div>
                <CardDescription className="text-slate-400 text-sm leading-relaxed pt-2">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto border-t border-white/5 pt-4">
                <Button className="w-full" asChild>
                  <Link href={`/agents/${agent.id}`}>Launch</Link>
                </Button>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
