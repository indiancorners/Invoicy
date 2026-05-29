import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { FileDown, ImageDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceData } from '../types';
import { supabase } from '../lib/supabaseClient';
import { cn, exportToPDF, exportToPNG } from '../lib/utils';
import { BrandLogo } from './BrandLogo';
import { InvoicePreview } from './InvoicePreview';

type FetchState = 'loading' | 'found' | 'not-found';

export const PreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');
  const [fetchState, setFetchState] = useState<FetchState>('loading');
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Require both id and token. Without the token, we don't even hit Supabase
    // — prevents enumeration of invoice IDs from the network panel.
    if (!id || !token) {
      setFetchState('not-found');
      return;
    }

    const fetchInvoice = async () => {
      try {
        // SECURITY DEFINER RPC: returns the invoice content only when both the
        // id and the secret publicToken match. Runs under RLS-bypassing
        // privileges but is safe because the token gate is enforced in SQL —
        // anonymous visitors can't enumerate or read invoices any other way.
        const { data, error } = await supabase.rpc('get_public_invoice', {
          p_id: id,
          p_token: token,
        });

        const content = data as any;
        if (error || !content || typeof content !== 'object' || !('id' in content) || !('items' in content)) {
          setFetchState('not-found');
          return;
        }

        setInvoice(content as InvoiceData);
        setFetchState('found');
      } catch {
        setFetchState('not-found');
      }
    };

    fetchInvoice();
  }, [id, token]);

  const handleExportPDF = async () => {
    if (!invoice || isExporting) return;
    setIsExporting(true);
    try {
      await exportToPDF('invoice-capture', `Invoice-${invoice.number}`);
      toast.success('PDF downloaded.');
    } catch {
      toast.error('PDF export failed. Check pop-up permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    if (!invoice || isExporting) return;
    setIsExporting(true);
    try {
      await exportToPNG('invoice-capture', `Invoice-${invoice.number}`);
      toast.success('PNG downloaded.');
    } catch {
      toast.error('PNG export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <BrandLogo className="w-8 h-8" />
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-foreground tracking-tight text-sm">
                Invoicy
              </span>
              <span className="text-muted text-[9px] font-medium">
                Studio-Grade Invoicing
              </span>
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/"
            className={cn(
              'text-xs font-medium',
              'text-accent hover:opacity-80 transition-opacity duration-150'
            )}
          >
            Create yours free →
          </Link>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center px-4 py-12 gap-10">
        {fetchState === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-muted">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-medium">Loading invoice…</p>
            </div>
          </div>
        )}

        {fetchState === 'not-found' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center">
              <BrandLogo className="w-16 h-16 opacity-20" />
              <div className="space-y-2">
                <p className="text-foreground font-semibold text-sm">
                  Invoice not found
                </p>
                <p className="text-muted text-xs">
                  This link may have expired or the invoice doesn't exist.
                </p>
              </div>
              <Link
                to="/"
                className="text-xs font-medium text-accent hover:opacity-80 transition-opacity duration-150"
              >
                Create your own →
              </Link>
            </div>
          </div>
        )}

        {fetchState === 'found' && invoice && (
          <>
            {/* Scaled invoice */}
            <div className="w-full overflow-x-auto flex justify-center">
              <div style={{ zoom: 0.8 }}>
                <InvoicePreview data={invoice} />
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className={cn(
                  'rounded-full bg-[#1D1D1F] text-white h-10 px-6 text-[13px] font-medium flex items-center gap-2',
                  'hover:opacity-80',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                Download PDF
              </button>

              <button
                onClick={handleExportPNG}
                disabled={isExporting}
                className={cn(
                  'rounded-full border border-border bg-subtle text-foreground h-10 px-6 text-[13px] font-medium flex items-center gap-2',
                  'hover:opacity-80',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageDown className="w-4 h-4" />
                )}
                Download PNG
              </button>
            </div>

            {/* Bottom CTA */}
            <p className="text-xs font-medium text-placeholder">
              Made with{' '}
              <Link to="/" className="text-accent hover:opacity-80 transition-opacity duration-150">
                Invoicy
              </Link>{' '}
              — Studio-grade invoicing for free.
            </p>
          </>
        )}
      </main>
    </div>
  );
};
