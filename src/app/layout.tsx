import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cash Management System | Multi-Branch Financial Operations',
  description: 'Enterprise cash operations, dual-custody transfers, vault & till reconciliations, and double-entry accounting.',
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
