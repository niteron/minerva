import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { LogOut } from 'lucide-react';

import { VoiceChat } from '@/components/voice-chat/index.tsx';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const authComponents = {
  Header() {
    return (
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="pb-6 text-center">
          <CardTitle>Voice Agent</CardTitle>
          <CardDescription>Nova Sonic voice conversational agent</CardDescription>
        </CardHeader>
      </Card>
    );
  },
};

function App() {
  return (
    <Authenticator components={authComponents}>
      {({ signOut }) => <MainApp signOut={signOut} />}
    </Authenticator>
  );
}

function MainApp({ signOut }: { signOut?: () => void }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-3xl items-start justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-lg font-medium">Nova — Japanese tutor</p>
            <p className="text-muted-foreground text-sm">
              Built with AgentCore, Strands, and Amplify
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={signOut}>
            <LogOut />
            Sign out
          </Button>
        </div>
      </header>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <VoiceChat />
      </main>
    </div>
  );
}

export default App;
