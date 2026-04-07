import React from 'react';

const Loading = ({ fullPage = true }) => {
  return (
    <div className={`flex flex-col justify-center items-center ${fullPage ? 'min-h-[60vh]' : 'p-4'} w-full transition-all duration-500`}>
      <div className="relative flex items-center justify-center">
        {/* Outer Glow */}
        <div className="absolute w-20 h-20 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
        
        {/* Large Spinning Ring */}
        <div className="w-14 h-14 rounded-full border-2 border-slate-100 border-t-blue-600 animate-spin shadow-sm"></div>
        
        {/* Opposite Spinning Ring */}
        <div 
          className="absolute w-10 h-10 rounded-full border-2 border-transparent border-l-indigo-500 animate-spin transition-all origin-center" 
          style={{ animationDuration: '1.2s', animationDirection: 'reverse' }}
        ></div>
        
        {/* Inner Gradient Pulse */}
        <div className="absolute w-4 h-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full animate-pulse shadow-md"></div>
      </div>
      
      {fullPage && (
        <div className="mt-8 flex flex-col items-center">
          <div className="relative">
             <span className="text-slate-800 font-bold text-xl tracking-tight">Kasuwar</span>
             <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600/0 via-blue-600 to-blue-600/0"></div>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-3 animate-pulse opacity-80">Syncing with server</p>
        </div>
      )}
    </div>
  );
};

export default Loading;
