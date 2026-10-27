import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Centralized Branch Fund Transfer Management System',
  description: 'Secure multi-branch fund transfer management, customer registration, bank approvals, and direct-to-customer bank transfers.',
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
