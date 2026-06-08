'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAdminToken } from '@/hooks/useAdminToken';
import type { Invoice, Quote, InvoiceStatus, QuoteStatus } from '@/lib/types';

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: 'Payée',
  unpaid: 'À régler',
  overdue: 'En retard',
};

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  paid: 'bg-green-500/20 text-green-400',
  unpaid: 'bg-orange-500/20 text-orange-400',
  overdue: 'bg-red-500/20 text-red-400',
};

const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  pending: 'En attente',
  accepted: 'Accepté',
  refused: 'Refusé',
  expired: 'Expiré',
};

const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  pending: 'bg-zinc-500/20 text-zinc-400',
  accepted: 'bg-blue-500/20 text-blue-400',
  refused: 'bg-red-500/20 text-red-400',
  expired: 'bg-zinc-500/20 text-zinc-500',
};

type Tab = 'invoices' | 'quotes';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function InvoicesPage() {
  const { token } = useAdminToken();
  const [activeTab, setActiveTab] = useState<Tab>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading reset is intentional before async fetch
    setLoading(true);
    setError(null);
    const endpoint = activeTab === 'invoices' ? '/invoices' : '/invoices/quotes';
    apiFetch<Invoice[] | Quote[]>(endpoint, token)
      .then((data) => {
        if (activeTab === 'invoices') {
          setInvoices(data as Invoice[]);
        } else {
          setQuotes(data as Quote[]);
        }
      })
      .catch(() => setError('Impossible de charger les données'))
      .finally(() => setLoading(false));
  }, [activeTab, token]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Devis & Factures</h1>
        <p className="text-sm text-zinc-400 mt-1">Documents Sage — consultation en lecture seule</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800/50 rounded-lg p-1 w-fit mb-6">
        {(['invoices', 'quotes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab === 'invoices' ? 'Factures' : 'Devis'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-zinc-400">{error}</div>
      ) : activeTab === 'invoices' ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Référence</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Émise le</th>
                <th className="text-left px-4 py-3">Échéance</th>
                <th className="text-right px-4 py-3">Montant</th>
                <th className="text-right px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-zinc-500">
                    Aucune facture
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-zinc-300">{inv.sageRef}</td>
                    <td className="px-4 py-3 text-zinc-400">{inv.clientId}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatDate(inv.issuedAt)}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      {inv.amount.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_COLORS[inv.status]}`}
                      >
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Référence</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Émis le</th>
                <th className="text-left px-4 py-3">Valide jusqu&apos;au</th>
                <th className="text-right px-4 py-3">Total HT</th>
                <th className="text-right px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-zinc-500">
                    Aucun devis
                  </td>
                </tr>
              ) : (
                quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-zinc-300">{q.sageRef}</td>
                    <td className="px-4 py-3 text-zinc-400">{q.clientId}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatDate(q.issuedAt)}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatDate(q.validUntil)}</td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      {q.totalHT.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${QUOTE_STATUS_COLORS[q.status]}`}
                      >
                        {QUOTE_STATUS_LABELS[q.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
