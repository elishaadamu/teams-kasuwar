"use client";
import Link from "next/link";
import { IoArrowBack, IoHome } from "react-icons/io5";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
      
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Animated 404 Text */}
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[12rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center font-bold">
            <h2 className="text-4xl md:text-6xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Lost in space?
            </h2>
          </div>
        </div>

        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-12 px-4 leading-relaxed">
          The page you're looking for has vanished into the digital void. Don't worry, 
          it happens to the best of us! Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
          >
            <IoHome size={20} className="group-hover:-translate-y-0.5 transition-transform" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 w-full sm:w-auto"
          >
            <IoArrowBack size={20} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>
      </div>

      {/* Subtle Bottom Grid or Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}