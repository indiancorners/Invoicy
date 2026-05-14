import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const [fetchState, setFetchState] = useState<FetchState>('loading');
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!id) {
      setFetchState('not-found');
      return;
    }

    const fetchInvoice = async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('content')
          .eq('id', id)
          .single();

        if (error || !data) {
          setFetchState('not-found');
          return;
        }

        const content = data.content;
        if (!content || typeof content !== 'object' || !('id' in content) || !('items' in content)) {
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
  }, [id]);

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
    <div className="min-h-screen bg-palladian flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-abyssal/10 bg-palladian/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <BrandLogo className="w-8 h-8 text-flame" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-abyssal uppercase tracking-widest text-sm">
                Invoicy
              </span>
              <span className="text-abyssal/50 uppercase tracking-widest text-[9px] font-bold">
                Studio-Grade Invoicing
              </span>
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/"
            className={cn(
              'text-xs font-bold uppercase tracking-widest',
              'text-flame hover:text-abyssal transition-colors duration-150'
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
            <div className="flex flex-col items-center gap-4 text-abyssal/50">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading invoice…</p>
            </div>
          </div>
        )}

        {fetchState === 'not-found' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center">
              <BrandLogo className="w-16 h-16 text-abyssal/20" />
              <div className="space-y-2">
                <p className="text-abyssal font-bold uppercase tracking-widest text-sm">
                  Invoice not found
                </p>
                <p className="text-abyssal/50 text-xs uppercase tracking-widest">
                  This link may have expired or the invoice doesn't exist.
                </p>
              </div>
              <Link
                to="/"
                className="text-xs font-bold uppercase tracking-widest text-flame hover:text-abyssal transition-colors duration-150"
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
                  'flex items-center gap-2 px-5 py-3',
                  'bg-abyssal text-oatmeal',
                  'text-xs font-bold uppercase tracking-widest',
                  'hover:bg-flame hover:text-oatmeal transition-colors duration-150',
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
                  'flex items-center gap-2 px-5 py-3',
                  'border-2 border-abyssal text-abyssal',
                  'text-xs font-bold uppercase tracking-widest',
                  'hover:border-flame hover:text-flame transition-colors duration-150',
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
            <p className="text-xs font-bold uppercase tracking-widest text-abyssal/40">
              Made with{' '}
              <Link to="/" className="text-flame hover:text-abyssal transition-colors duration-150">
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
