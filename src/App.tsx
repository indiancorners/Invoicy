/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAuth, SignIn, SignUp } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { InvoiceWizard } from './components/InvoiceWizard';
import { LandingPage } from './components/LandingPage';
import { AuthGuard } from './components/AuthGuard';
import { AppLayout } from './components/AppLayout';
import { Settings } from './components/Settings';
import { LegalPage } from './components/Legal';
import { PreviewPage } from './components/PreviewPage';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import { DEFAULT_INVOICE, InvoiceData } from './types';
import { fetchInvoices, saveInvoice, deleteInvoice } from './lib/invoiceService';

function AppContent() {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadInvoices = () => {
    if (!isSignedIn || !userId) return;
    setIsLoading(true);
    setFetchError(null);
    fetchInvoices(userId)
      .then(data => setInvoices(data))
      .catch(err => {
        console.error("Failed to fetch invoices from Supabase:", err);
        setFetchError('Failed to load invoices. Check your connection and retry.');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isSignedIn && userId) {
      loadInvoices();
    } else {
      setInvoices([]);
      setFetchError(null);
      setIsLoading(false);
    }
  }, [isSignedIn, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveInvoice = async (data: InvoiceData) => {
    if (!userId) return;
    try {
      await saveInvoice(data, userId);
      setInvoices(prev => {
        const exists = prev.find(i => i.id === data.id);
        if (exists) {
          return prev.map(i => i.id === data.id ? { ...data, lastModified: Date.now() } : i);
        }
        return [...prev, { ...data, lastModified: Date.now() }];
      });
      toast.success('Invoice saved.');
      navigate('/app');
    } catch (e) {
      console.error("Failed to save invoice:", e);
      toast.error('Failed to save invoice. Please try again.');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!userId) return;
    try {
      await deleteInvoice(id, userId);
      setInvoices(prev => prev.filter(i => i.id !== id));
      toast.success('Invoice deleted.');
    } catch (e) {
      console.error("Failed to delete invoice:", e);
      toast.error('Failed to delete invoice. Please try again.');
    }
  };

  const EditRoute = () => {
    const { id } = useParams();
    const invoice = invoices.find(i => i.id === id);
    if (!invoice && !isLoading) {
        return <Navigate to="/app" replace />;
    }
    if (isLoading) return (
      <div className="flex-1 min-h-screen bg-base flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-accent animate-spin" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Loading Invoice…</p>
      </div>
    );
    return <InvoiceWizard initialData={invoice!} onSave={handleSaveInvoice} />;
  };

  return (
    <div className="min-h-screen w-full">
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/*" element={
          <div className="min-h-screen bg-[#1D1D1F] flex items-center justify-center">
            <SignIn forceRedirectUrl="/app" signUpUrl="/sign-up" />
          </div>
        } />
        <Route path="/sign-up/*" element={
          <div className="min-h-screen bg-[#1D1D1F] flex items-center justify-center">
            <SignUp forceRedirectUrl="/app" signInUrl="/login" />
          </div>
        } />

        <Route path="/about" element={
          <LegalPage
            title="Design. Bill. Repeat."
            content="Invoicy was founded on the belief that administrative tools shouldn't look like spreadsheets from 1998. We combine high-end typography with a razor-sharp export engine to give your business a Pro aesthetic presence."
          />
        } />
        <Route path="/privacy" element={
          <LegalPage
            title="Your Data. Your Vault."
            content="We don't sell your data. We don't even see your data. Everything you create in Invoicy is securely stored. We believe in absolute privacy by default."
          />
        } />
        <Route path="/terms" element={
          <LegalPage
            title="The Ground Rules."
            content="Use Invoicy to bill your clients. Don't use it for illegal activities. Respect the donkey mascot. That's basically it."
          />
        } />

        {/* Public Preview */}
        <Route path="/preview/:id" element={<PreviewPage />} />

        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/app" element={<Dashboard invoices={invoices} onDelete={handleDeleteInvoice} isLoading={isLoading} fetchError={fetchError} onRetryFetch={loadInvoices} />} />
            <Route path="/app/create" element={<InvoiceWizard initialData={DEFAULT_INVOICE()} onSave={handleSaveInvoice} />} />
            <Route path="/app/edit/:id" element={<EditRoute />} />
            <Route path="/app/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
