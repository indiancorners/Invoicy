import React, { createContext, useContext } from 'react';
import { useInvoicyPro } from '../hooks/useInvoicyPro';

type ProValue = ReturnType<typeof useInvoicyPro>;

const ProContext = createContext<ProValue | null>(null);

// Single source of premium state. Without this, useInvoicyPro() runs in
// App + Dashboard + InvoiceWizard + AppLayout simultaneously, firing 3-4
// identical profiles queries per page load.
export function ProProvider({ value, children }: { value: ProValue; children: React.ReactNode }) {
  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export function usePro(): ProValue {
  const ctx = useContext(ProContext);
  if (!ctx) throw new Error('usePro must be used within a ProProvider');
  return ctx;
}
