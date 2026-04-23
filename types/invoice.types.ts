export type InvoiceStatus = 'pending' | 'paid' | 'overdue';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'refused' | 'invoiced';

export interface Invoice {
  id: string;
  sageId: string;
  clientId: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  issueDate: string;
  pdfUrl: string | null;
}

export interface Quote {
  id: string;
  sageId: string;
  clientId: string;
  amount: number;
  status: QuoteStatus;
  validUntil: string;
  createdAt: string;
  pdfUrl: string | null;
}
