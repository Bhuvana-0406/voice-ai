import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoiceFilter — Stop filtering. Just talk.',
  description: 'AI-powered conversational shopping system that replaces traditional e-commerce filters with natural language.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-100 text-[#0F1111] antialiased selection:bg-[#FEBD69] selection:text-[#0F1111]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
