import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Login",
    description: "Access your Niteron Workspace to manage legal documents, cases, and AI agents. Secure login for legal professionals.",
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="w-full">
            {children}
        </div>
    );
}