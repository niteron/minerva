import type { Metadata, Viewport } from 'next';

import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Legal Assessment Agent',
  description:
    'AI legal assessment experience built with Nova Sonic, AgentCore, Strands, and Amplify',
};

export const viewport: Viewport = {
  themeColor: '#1e1b4b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
