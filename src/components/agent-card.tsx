'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Lock, Play, Star } from 'lucide-react';
import type { Agent } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const gradientMap: Record<string, string> = {
  'bg-blue-500':
    'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600',
  'bg-purple-500':
    'bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500',
  'bg-emerald-500':
    'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600',
  'bg-amber-500':
    'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
};

function initialsFromName(name: string, fallback: string) {
  const fromName = name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return fromName || fallback.toUpperCase().slice(0, 2);
}

export function AgentCard({ agent }: { agent: Agent }) {
  const [favourited, setFavourited] = useState(false);
  const isComingSoon = agent.comingSoon ?? false;
  const canLaunch = !isComingSoon;
  const capabilities = agent.capabilities ?? [];
  const showRating =
    typeof agent.rating === 'number' &&
    typeof agent.reviewCount === 'number';

  const gradient =
    agent.avatarColor && gradientMap[agent.avatarColor]
      ? gradientMap[agent.avatarColor]
      : 'bg-gradient-to-br from-primary via-primary to-primary/80';

  const initials = initialsFromName(agent.name, agent.initial);

  return (
    <Card className="group flex h-full w-full max-w-sm flex-col gap-2 rounded-2xl border-border/40 py-4 transition-all duration-300 hover:border-border/60 hover:shadow-lg">
      <CardHeader className="gap-3 px-5 pb-2">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className={cn('h-10 w-10 shrink-0 rounded-full', gradient)}>
            <AvatarFallback
              className={cn(
                'rounded-full text-sm font-bold text-white',
                gradient
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-0.5">
            <CardTitle className="text-sm font-semibold tracking-tight">
              {agent.name}
            </CardTitle>
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              {agent.subtitle}
            </p>
          </div>
        </div>
        <CardDescription className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {agent.description}
        </CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-transparent hover:text-red-500"
            aria-pressed={favourited}
            aria-label={
              favourited
                ? `Remove ${agent.name} from favourites`
                : `Add ${agent.name} to favourites`
            }
            onClick={(e) => {
              e.stopPropagation();
              setFavourited((v) => !v);
            }}
          >
            <Heart
              className={cn(
                'h-4 w-4',
                favourited
                  ? 'fill-red-500 text-red-500'
                  : 'fill-transparent text-muted-foreground/40 hover:text-red-500'
              )}
            />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3 px-5">
        {agent.bio ? (
          <p className="text-[11px] italic leading-relaxed text-muted-foreground/70">
            &ldquo;{agent.bio}&rdquo;
          </p>
        ) : null}
        {capabilities.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {capabilities.map((cap) => (
              <span
                key={cap}
                className="rounded-md border border-border/20 bg-muted/50 px-2 py-0.5 text-[9px] font-medium text-muted-foreground"
              >
                {cap}
              </span>
            ))}
          </div>
        ) : null}
        {showRating ? (
          <div className="flex items-center pt-1">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <p className="ml-1 text-xs font-medium">
              {agent.rating!.toFixed(1)}{' '}
              <span className="text-muted-foreground">
                ({agent.reviewCount})
              </span>
            </p>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="mt-auto gap-2 px-5">
        {canLaunch ? (
          <Button
            className="h-9 w-full border-0 bg-gradient-to-r from-[#006FEE] to-[#7828C8] text-xs font-semibold text-white transition-all hover:opacity-90"
            asChild
          >
            <Link href={`/agents/${agent.id}`}>
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Launch
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            className="h-9 w-full text-xs font-semibold"
            disabled
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            Coming Soon
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
