import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
    title: "JobHub",
    description: "JobHub Platform",
};


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (

        <html lang="ru">

            <body className="min-h-screen bg-slate-50 text-slate-900">

                <AuthProvider>

                    <div className="flex min-h-screen flex-col">

                        <Header />

                        <main className="flex-1">
                            {children}
                        </main>

                        <Footer />

                    </div>

                </AuthProvider>

            </body>

        </html>
    );
}