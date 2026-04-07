import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/app-shell.tsx';
import { AgentCallPage } from '@/pages/agent-call-page.tsx';
import { AgentsPage } from '@/pages/agents-page.tsx';
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/agents" replace />} />
        <Route element={<AppShell signOut={signOut} />}>
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:id" element={<AgentCallPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
