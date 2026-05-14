import { supabase } from './supabaseClient';
import { InvoiceData } from '../types';

export const saveInvoice = async (data: InvoiceData, userId: string) => {
  const { data: result, error } = await supabase
    .from('invoices')
    .upsert({
      id: data.id,
      user_id: userId,
      content: data,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
};

export const fetchInvoices = async (userId: string): Promise<InvoiceData[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map((row: any) => row.content as InvoiceData);
};

export const deleteInvoice = async (invoiceId: string, userId: string) => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
    .eq('user_id', userId);

  if (error) throw error;
};
