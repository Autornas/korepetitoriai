import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/frontend/components/AuthProvider';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = {
  title: 'Korepetitor',
  description: 'Tutor and student platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col antialiased">
          <AuthProvider>{children}</AuthProvider>
        </body>
    </html>
  );
}
