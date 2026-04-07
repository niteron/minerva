"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { Authenticator } from '@aws-amplify/ui-react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <Authenticator.Provider>
      <NextThemesProvider {...themeProps}>
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </NextThemesProvider>
    </Authenticator.Provider>
  );
}
