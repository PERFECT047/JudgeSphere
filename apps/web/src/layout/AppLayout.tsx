import { useLocation } from "react-router-dom";
import ThemeToggle from "../component/ThemeToggle";
import Navbar from "../component/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="w-screen min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      
      {/* Decorative gradient blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-70 mix-blend-multiply dark:mix-blend-normal">
        <div 
          className="
            absolute 
            -top-[20%] 
            -left-[10%] 
            w-[60vw] 
            h-[60vw] 
            rounded-full 
            bg-gradient-to-tr 
            from-teal-200/20 
            to-sky-300/30 
            dark:from-teal-950/20 
            dark:to-indigo-950/30 
            blur-[160px]
          " 
        />
        
        <div 
          className="
            absolute 
            -bottom-[20%] 
            -right-[10%] 
            w-[50vw] 
            h-[50vw] 
            rounded-full 
            bg-gradient-to-br 
            from-purple-200/20 
            to-indigo-200/20 
            dark:from-slate-900/40 
            dark:to-purple-950/10 
            blur-[140px]
          " 
        />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="
          fixed 
          inset-0 
          z-0 
          opacity-[0.015] 
          dark:opacity-[0.03] 
          pointer-events-none 
          bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] 
          bg-[size:24px_24px]
        " 
      />

      {/* Navbar - only on authenticated pages */}
      {
        !isLoginPage ? 
        <Navbar /> : 
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
      }

      {/* Main Content */}
      <div className="relative z-10">
        {isLoginPage ? (
          <div className="min-h-screen flex items-center justify-center p-6">
            {children}
          </div>
        ) : (
          <div className="pt-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}