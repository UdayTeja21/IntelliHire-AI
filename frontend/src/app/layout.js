import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SidebarProvider } from '../context/SidebarContext';
import { NotificationProvider } from '../context/NotificationContext';
import Sidebar from '../components/layout/Sidebar';
import MainLayoutWrapper from '../components/layout/MainLayoutWrapper';
import { ToastProvider } from '../components/Toast';

export const metadata = {
  title: 'IntelliHire AI — AI-Powered Interview & Resume Platform',
  description: 'Master your next interview with AI-powered mock sessions and ATS resume analysis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-[#f8f9fc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-hidden flex transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <SidebarProvider>
                <ToastProvider>
                  <Sidebar />
                  <MainLayoutWrapper>
                    {children}
                  </MainLayoutWrapper>
                </ToastProvider>
              </SidebarProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
