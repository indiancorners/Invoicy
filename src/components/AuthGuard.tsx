import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

export const AuthGuard: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-palladian flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-flame animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-abyssal/40">Loading Vault...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
