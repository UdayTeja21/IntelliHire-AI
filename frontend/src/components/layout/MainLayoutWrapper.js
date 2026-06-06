"use client";
import { useSidebar } from '../../context/SidebarContext';
import Topbar from './Topbar';

export default function MainLayoutWrapper({ children }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ml-0 ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[260px]'}`}>
      <Topbar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
