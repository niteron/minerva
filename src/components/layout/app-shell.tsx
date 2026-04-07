import { Link, Outlet, useMatch } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { getAgentById } from '@/lib/agents.ts';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';

export function AppShell({ signOut }: { signOut?: () => void }) {
  const agentMatch = useMatch('/agents/:id');
  const id = agentMatch?.params.id;
  const agent = id ? getAgentById(id) : undefined;

  return (
    <div className="bg-slate-950 text-slate-50 flex min-h-screen flex-col">
      <header className="border-white/10 border-b bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-base font-medium tracking-tight text-white">Voice agent</p>
            <p className="text-slate-400 text-xs">Nova Sonic · Amplify</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-white/10 hover:text-white shrink-0"
            onClick={signOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="border-white/10 border-b bg-slate-950/70">
        <div className="mx-auto max-w-3xl px-4 py-2.5">
          <Breadcrumb>
            <BreadcrumbList className="text-slate-500 sm:gap-2">
              <BreadcrumbItem>
                {agentMatch && agent ? (
                  <BreadcrumbLink asChild>
                    <Link
                      to="/agents"
                      className="text-slate-400 hover:text-white"
                    >
                      Agents
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-medium text-slate-200">
                    Agents
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {agentMatch && agent && (
                <>
                  <BreadcrumbSeparator className="text-slate-600 [&>svg]:text-slate-600" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium text-slate-100">
                      {agent.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-6 pt-4">
        <Outlet />
      </main>
    </div>
  );
}
