import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ToastProvider } from '../components/Toast';

export const metadata = {
  title: 'CareerSync AI — AI-Powered Interview & Resume Platform',
  description: 'Master your next interview with AI-powered mock sessions and ATS resume analysis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0f1e] text-white antialiased">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
