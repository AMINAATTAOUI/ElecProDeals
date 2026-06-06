export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue';
export type QuoteStatus = 'pending' | 'accepted' | 'refused' | 'expired';

export interface Invoice {
  id: string;
  sageRef: string;
  clientId: string;
  orderId: string | null;
  amount: number;
  vatAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedAt: string;
  pdfUrl: string | null;
}

export interface QuoteItem {
  productRef: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  sageRef: string;
  clientId: string;
  items: QuoteItem[];
  totalHT: number;
  status: QuoteStatus;
  validUntil: string;
  issuedAt: string;
  pdfUrl: string | null;
}
