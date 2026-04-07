"use client";

import {
  Authenticator,
  ThemeProvider,
  Theme,
  useAuthenticator,
  ColorMode,
} from "@aws-amplify/ui-react";

import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { View, Image, Text, useTheme as useAmplifyTheme } from '@aws-amplify/ui-react';
import { siteConfig } from '../../config/site';

export default function AuthPage() {

  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const router = useRouter();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      const redirectTo = '/';
      router.push(redirectTo);
    }
  }, [authStatus, router]);

  I18n.putVocabularies(translations);
  I18n.setLanguage('en');
  I18n.putVocabularies({
    en: {
      'Sign In with Google': 'Login with Google',
      'Sign Up with Google': 'Login with Google',
      'Sign In': 'Login',
      'Sign in': 'Login',
      'Sign Up': 'Sign Up ',
      'Send code': 'Send Code'
    },
  });

  const { theme } = useTheme();
  const [colorMode, setColorMode] = React.useState<ColorMode>('system');

  useEffect(() => {
    setColorMode(theme === 'dark' ? 'dark' : 'light');
  }, [theme, setColorMode]);

  const amplifyTheme: Theme = {
    name: 'theme',
    tokens: {
      colors: {
        brand: {
          primary: {
            10: 'oklch(0.99 0 0)',     // Very light gray
            20: 'oklch(0.97 0 0)',     // Light gray
            40: 'oklch(0.92 0 0)',     // Medium gray
            60: 'oklch(0 0 0)',        // Black for primary button
            80: 'oklch(0.20 0 0)',     // Dark gray for hover
            100: 'oklch(0 0 0)',       // Black
          },
        },
        background: {
          primary: { value: 'oklch(1 0 0)' },        // White
          secondary: { value: 'oklch(0.99 0 0)' },   // Off-white
        },
        font: {
          primary: { value: 'oklch(0 0 0)' },        // Black
          secondary: { value: 'oklch(0.50 0 0)' },   // Medium gray
          tertiary: { value: 'oklch(0.65 0 0)' },    // Light gray
        },
        border: {
          primary: { value: 'oklch(0.92 0 0)' },     // Light gray border
          secondary: { value: 'oklch(0.97 0 0)' },   // Very light gray
        },
      },
      components: {
        button: {
          primary: {
            backgroundColor: { value: 'oklch(0 0 0)' },      // Black
            color: { value: 'oklch(1 0 0)' },                // White
            _hover: {
              backgroundColor: { value: 'oklch(0.20 0 0)' }, // Dark gray
            },
            _focus: {
              backgroundColor: { value: 'oklch(0.20 0 0)' },
              boxShadow: { value: 'none' },
            },
            _active: {
              backgroundColor: { value: 'oklch(0.30 0 0)' }, // Medium dark gray
            },
            _disabled: {
              backgroundColor: { value: 'oklch(0.92 0 0)' }, // Light gray
              color: { value: 'oklch(0.65 0 0)' },           // Muted gray
            }
          },
          link: {
            color: { value: 'oklch(0 0 0)' },                // Black
            _hover: {
              color: { value: 'oklch(0.30 0 0)' },           // Dark gray
            },
            _focus: {
              color: { value: 'oklch(0.30 0 0)' },
              boxShadow: { value: 'none' },
            }
          },
        },
        fieldcontrol: {
          borderColor: { value: 'oklch(0.92 0 0)' },         // Light gray border
          color: { value: 'oklch(0 0 0)' },                  // Black text
          _focus: {
            borderColor: { value: 'oklch(0 0 0)' },          // Black border on focus
            boxShadow: { value: 'none' },
          },
          _error: {
            borderColor: { value: 'oklch(0.577 0.245 27.325)' }, // Red (destructive)
          },
        },
        text: {
          color: { value: 'oklch(0 0 0)' },                  // Black
        },
        heading: {
          color: { value: 'oklch(0 0 0)' },                  // Black
          lineHeight: { value: '1.4' },
        },
        tabs: {
          item: {
            color: { value: 'oklch(0.50 0 0)' },             // Medium gray
            borderColor: { value: 'transparent' },
            _active: {
              color: { value: 'oklch(0 0 0)' },              // Black
              borderColor: { value: 'oklch(0 0 0)' },        // Black
            },
            _hover: {
              color: { value: 'oklch(0 0 0)' },              // Black
            },
          },
          borderColor: { value: 'oklch(0.92 0 0)' },         // Light gray
        },
      },
      space: {
        small: { value: '12px' },
        medium: { value: '16px' },
        large: { value: '24px' },
      },
    },
    overrides: [
      {
        colorMode: 'dark',
        tokens: {
          colors: {
            background: {
              primary: { value: 'oklch(0.205 0 0)' },  // Match card background
              secondary: { value: 'oklch(0.269 0 0)' },
            },
            font: {
              primary: { value: 'oklch(0.985 0 0)' },        // Off-white
              secondary: { value: 'oklch(0.65 0 0)' },       // Medium gray
              tertiary: { value: 'oklch(0.50 0 0)' },        // Dark gray
            },
            border: {
              primary: { value: 'oklch(1 0 0 / 10%)' },  // Match site border
              secondary: { value: '#171717' },
            },
          },
          components: {
            button: {
              primary: {
                backgroundColor: { value: 'oklch(1 0 0)' },      // White
                color: { value: 'oklch(0 0 0)' },                // Black
                _hover: {
                  backgroundColor: { value: 'oklch(0.92 0 0)' }, // Light gray
                },
                _focus: {
                  backgroundColor: { value: 'oklch(0.92 0 0)' },
                },
                _active: {
                  backgroundColor: { value: 'oklch(0.85 0 0)' }, // Medium gray
                },
              },
              link: {
                color: { value: 'oklch(0.985 0 0)' },           // Off-white
                _hover: {
                  color: { value: 'oklch(0.85 0 0)' },          // Light gray
                },
              },
            },
            fieldcontrol: {
              borderColor: { value: 'oklch(1 0 0 / 10%)' },     // Transparent white border
              color: { value: 'oklch(0.985 0 0)' },             // Off-white
              _focus: {
                borderColor: { value: 'oklch(0.985 0 0)' },     // Off-white border
              },
            },
            text: {
              color: { value: 'oklch(0.985 0 0)' },             // Off-white
            },
            heading: {
              color: { value: 'oklch(0.985 0 0)' },             // Off-white
            },
            tabs: {
              item: {
                color: { value: 'oklch(0.50 0 0)' },            // Medium gray
                borderColor: { value: 'transparent' },
                _active: {
                  color: { value: 'oklch(0.985 0 0)' },         // Off-white
                  borderColor: { value: 'oklch(0.985 0 0)' },   // Off-white
                },
                _hover: {
                  color: { value: 'oklch(0.85 0 0)' },          // Light gray
                },
              },
              borderColor: { value: 'oklch(0.269 0 0)' },       // Dark gray
            },
          },
        },
      },
    ],
  };

  const components = {
    Header() {
      const { tokens } = useAmplifyTheme();

      return (
        <View textAlign="center" padding={tokens.space.large}>
          <Image
            alt={`${siteConfig.name} logo`}
            src="/brand.svg"
            style={{ maxWidth: '200px', margin: '0 auto' }}
          />
        </View>
      );
    },

    Footer() {
      const { tokens } = useAmplifyTheme();

      return (
        <View textAlign="center" padding={tokens.space.large}>
          <Text color={tokens.colors.neutral[80]}>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved
          </Text>
        </View>
      );
    },
  };

  const formFields = {
    signUp: {
      name: {
        order: 1,
      },  
      email: {
        order: 2,
      },
      password: {
        order: 3
      },
      confirm_password: {
        order: 4
      }
    },
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center p-6 md:p-10 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#006FEE]/[0.03] to-[#7828C8]/[0.03] rounded-full blur-[100px]" />
      <div className="relative w-full max-w-sm z-10">
        {/* Authenticator */}
        <ThemeProvider colorMode={colorMode} theme={amplifyTheme}>
          <Authenticator
            signUpAttributes={[
              'name',
              'email',
              'picture',
            ]}
            //formFields={formFields}
            initialState="signIn"
            variation="modal"
            socialProviders={["google"]}
            //components={components}
            className="w-full"
          >
            {({ signOut }) => (
              <div className="text-center space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  You are signed in!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to the dashboard...
                </p>
              </div>
            )}
          </Authenticator>
        </ThemeProvider>
      </div>
    </div>
  );
}