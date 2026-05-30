import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { ToastProvider } from '../components/Toast';

export const metadata = {
  title: 'IntelliHire AI — AI-Powered Interview & Resume Platform',
  description: 'Master your next interview with AI-powered mock sessions and ATS resume analysis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-[#050511] text-white overflow-hidden flex">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Sidebar />
              <div className="flex-1 flex flex-col h-screen overflow-hidden ml-[260px]">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                  <div className="max-w-6xl mx-auto w-full">
                    {children}
                  </div>
                </main>
              </div>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
