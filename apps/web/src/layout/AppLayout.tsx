import React from "react";
import ThemeToggle from "../component/ThemeToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (

    <div className="w-screen min-h-screen bg-[#f8fafc] dark:bg-[#09090b] transition-colors duration-300 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-70 mix-blend-multiply dark:mix-blend-normal">

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

      <div 
        className="
          absolute 
          inset-0 
          z-0 
          opacity-[0.015] 
          dark:opacity-[0.03] 
          pointer-events-none 
          bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] 
          bg-[size:24px_24px]
        " 
      />

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <main className="relative z-10 min-h-screen w-full flex items-center justify-center p-6">
        {children}
      </main>

    </div>
  );
}