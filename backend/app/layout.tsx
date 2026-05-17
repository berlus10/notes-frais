import type { Metadata } from "next";
import "./globals.css";
import ClientHeader from './components/ClientHeader';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "BANG - Notes de frais",
  description: "Gestion spéléo des notes de frais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased font-sans`}>
      <body className="min-h-screen flex flex-col pt-16 bg-cave-bg text-cave-text-100">
        <ClientHeader />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
  
}