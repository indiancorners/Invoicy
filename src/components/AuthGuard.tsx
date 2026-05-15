import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

export const AuthGuard: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-accent animate-spin" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Loading…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
