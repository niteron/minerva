'use client';

import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { I18n } from 'aws-amplify/utils';
import { Authenticator } from '@aws-amplify/ui-react';
import { translations } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import outputs from '../../amplify_outputs.json';
import { AppShell } from '@/components/layout/app-shell';
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
          <CardTitle>Legal Assessment Agent</CardTitle>
          <CardDescription>Nova Legal AI for legal issue assessment and intake</CardDescription>
        </CardHeader>
      </Card>
    );
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    Amplify.configure(outputs);
    I18n.putVocabularies(translations);
    I18n.setLanguage('en');
  }, []);

  return (
    <Authenticator components={authComponents}>
      {({ signOut }) => <AppShell signOut={signOut}>{children}</AppShell>}
    </Authenticator>
  );
}
