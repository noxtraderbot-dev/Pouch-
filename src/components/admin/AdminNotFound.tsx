/**
 * Custom 404 Security Gate for /admin
 */

import React, { useState } from 'react';

interface AdminNotFoundProps {
  onUnlock: () => void;
}

export const AdminNotFound: React.FC<AdminNotFoundProps> = ({ onUnlock }) => {
  const [tapCount, setTapCount] = useState(0);

  const handleTap = () => {
    const newCount = tapCount + 1;
    if (newCount === 6) {
      onUnlock();
    } else {
      setTapCount(newCount);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-100">
      <div 
        onClick={handleTap}
        className="text-[120px] font-bold text-gold-500 cursor-pointer select-none transition-all hover:scale-105 active:scale-95"
      >
        404
      </div>
      <h1 className="text-2xl font-semibold mt-4">Page Not Found</h1>
      <p className="text-slate-400 mt-2 max-w-sm text-center">
        The requested page could not be located. If you believe this is an error, please return to our homepage.
      </p>
      <a 
        href="/"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = '/';
        }}
        className="mt-6 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors shadow-sm cursor-pointer"
      >
        Return to Main Banking App
      </a>
    </div>
  );
};
