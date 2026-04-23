export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue';
export type QuoteStatus = 'pending' | 'accepted' | 'refused' | 'expired';

export interface Invoice {
  id: string;
  sageRef: string;
  clientId: string;
  orderId: string | null;
  amount: number;
  vatAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  issuedAt: Date;
  pdfUrl: string | null;
}

export interface Quote {
  id: string;
  sageRef: string;
  clientId: string;
  items: Array<{ productRef: string; productName: string; quantity: number; unitPrice: number }>;
  totalHT: number;
  status: QuoteStatus;
  validUntil: Date;
  issuedAt: Date;
  pdfUrl: string | null;
}
