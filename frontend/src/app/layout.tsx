import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HorusAgent-AI | Enterprise Autonomous Multi-Agent & Vector RAG Platform',
  description: 'Enterprise Autonomous Multi-Agent Orchestration & Real-Time Vector RAG Intelligence Platform inspired by the all-seeing Eye of Horus.',
  icons: {
    icon: '/horus-emblem.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-horus-dark text-slate-100 min-h-screen cyber-grid-bg antialiased selection:bg-horus-cyan selection:text-black">
        {children}
      </body>
    </html>
  );
}
