import {
    Raleway as FontSans,
    Poppins as FontDisplay,
    JetBrains_Mono as FontMono,
  } from "next/font/google";
  
  // Primary sans-serif - Raleway
  export const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
  });
  
  // Monospace for code
  export const fontMono = FontMono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
  });
  
  // Secondary / display font - Poppins
  export const fontDisplay = FontDisplay({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
  });