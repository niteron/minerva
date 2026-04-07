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

export default function AgentsPage() {
  return (
    <ul className="p-5 grid gap-4 sm:grid-cols-2">
      {AGENTS.map((agent) => (
        <li key={agent.id}>
          <Card>
            <CardHeader>
              <CardTitle>{agent.name}</CardTitle>
              <p>{agent.subtitle}</p>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href={`/agents/${agent.id}`}>Launch</Link>
              </Button>
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}
